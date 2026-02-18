import express from 'express';
import cors from 'cors';
import keytar from 'keytar';

const app = express();
const PORT = 3001;
const SERVICE_NAME = 'SecureVault';

// Middleware
app.use(cors());
app.use(express.json());

// Check if keychain is available
let keychainAvailable = false;
let fallbackStorage = {}; // Fallback in-memory storage when keychain is unavailable

// Test keychain availability
try {
  await keytar.setPassword(SERVICE_NAME, '__test__', 'test');
  await keytar.deletePassword(SERVICE_NAME, '__test__');
  keychainAvailable = true;
  console.log('✅ OS keychain is available and will be used for secure storage');
} catch (error) {
  console.warn('⚠️  OS keychain is not available. Using in-memory storage as fallback.');
  console.warn('   Note: Secrets will be lost when the server restarts.');
}

// In-memory cache for secret metadata (keychain only stores key-value pairs)
// We'll store the full secret objects here, but the values will be in the keychain
let secretsMetadata = [];

// Storage abstraction layer
const storage = {
  async setPassword(service, account, password) {
    if (keychainAvailable) {
      return await keytar.setPassword(service, account, password);
    } else {
      fallbackStorage[account] = password;
    }
  },
  
  async getPassword(service, account) {
    if (keychainAvailable) {
      return await keytar.getPassword(service, account);
    } else {
      return fallbackStorage[account] || null;
    }
  },
  
  async deletePassword(service, account) {
    if (keychainAvailable) {
      return await keytar.deletePassword(service, account);
    } else {
      delete fallbackStorage[account];
      return true;
    }
  }
};

// Helper function to get all secrets with their values from keychain
async function getAllSecrets() {
  const secrets = [];
  for (const meta of secretsMetadata) {
    try {
      const value = await storage.getPassword(SERVICE_NAME, meta.id);
      if (value) {
        secrets.push({
          ...meta,
          value: value
        });
      }
    } catch (error) {
      console.error(`Error getting secret ${meta.id}:`, error);
    }
  }
  return secrets;
}

// GET /api/secrets - Get all secrets
app.get('/api/secrets', async (req, res) => {
  try {
    const secrets = await getAllSecrets();
    res.json(secrets);
  } catch (error) {
    console.error('Error fetching secrets:', error);
    res.status(500).json({ error: 'Failed to fetch secrets' });
  }
});

// POST /api/secrets - Create a new secret
app.post('/api/secrets', async (req, res) => {
  try {
    const { id, title, value, category, notes, createdAt, updatedAt } = req.body;
    
    if (!id || !title || !value || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store the secret value in keychain
    await storage.setPassword(SERVICE_NAME, id, value);
    
    // Store metadata
    const metadata = { id, title, category, notes, createdAt, updatedAt };
    secretsMetadata.push(metadata);
    
    res.status(201).json({ ...metadata, value });
  } catch (error) {
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Failed to create secret' });
  }
});

// PUT /api/secrets/:id - Update a secret
app.put('/api/secrets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, category, notes, updatedAt } = req.body;
    
    const metaIndex = secretsMetadata.findIndex(s => s.id === id);
    if (metaIndex === -1) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    
    // Update the secret value in keychain
    await storage.setPassword(SERVICE_NAME, id, value);
    
    // Update metadata
    secretsMetadata[metaIndex] = {
      ...secretsMetadata[metaIndex],
      title,
      category,
      notes,
      updatedAt
    };
    
    res.json({ ...secretsMetadata[metaIndex], value });
  } catch (error) {
    console.error('Error updating secret:', error);
    res.status(500).json({ error: 'Failed to update secret' });
  }
});

// DELETE /api/secrets/:id - Delete a secret
app.delete('/api/secrets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const metaIndex = secretsMetadata.findIndex(s => s.id === id);
    if (metaIndex === -1) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    
    // Delete from keychain
    await storage.deletePassword(SERVICE_NAME, id);
    
    // Delete metadata
    secretsMetadata.splice(metaIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting secret:', error);
    res.status(500).json({ error: 'Failed to delete secret' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SecureVault Backend' });
});

app.listen(PORT, () => {
  console.log(`🔒 SecureVault backend server running on http://localhost:${PORT}`);
  if (keychainAvailable) {
    console.log(`📦 Secrets will be stored securely in your OS keychain`);
  } else {
    console.log(`⚠️  Using in-memory storage (secrets will be lost on restart)`);
  }
});
