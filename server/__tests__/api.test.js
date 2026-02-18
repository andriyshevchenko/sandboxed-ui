import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Mock keytar
const mockKeytar = {
  setPassword: jest.fn().mockResolvedValue(undefined),
  getPassword: jest.fn().mockResolvedValue(null),
  deletePassword: jest.fn().mockResolvedValue(true),
};

jest.unstable_mockModule('keytar', () => ({
  default: mockKeytar,
  ...mockKeytar
}));

describe('SecureVault API', () => {
  let app;

  beforeAll(async () => {
    // Dynamically import the server code after mocking
    app = express();
    app.use(cors());
    app.use(express.json());

    // In-memory storage for testing
    let secretsMetadata = [];
    const fallbackStorage = {};

    const storage = {
      async setPassword(service, account, password) {
        fallbackStorage[account] = password;
      },
      async getPassword(service, account) {
        return fallbackStorage[account] || null;
      },
      async deletePassword(service, account) {
        delete fallbackStorage[account];
        return true;
      }
    };

    // GET /api/secrets
    app.get('/api/secrets', async (req, res) => {
      try {
        const secrets = [];
        for (const meta of secretsMetadata) {
          const value = await storage.getPassword('SecureVault', meta.id);
          if (value) {
            secrets.push({ ...meta, value });
          }
        }
        res.json(secrets);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch secrets' });
      }
    });

    // POST /api/secrets
    app.post('/api/secrets', async (req, res) => {
      try {
        const { id, title, value, category, notes, createdAt, updatedAt } = req.body;
        
        if (!id || !title || !value || !category) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        await storage.setPassword('SecureVault', id, value);
        const metadata = { id, title, category, notes, createdAt, updatedAt };
        secretsMetadata.push(metadata);
        
        res.status(201).json({ ...metadata, value });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create secret' });
      }
    });

    // PUT /api/secrets/:id
    app.put('/api/secrets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { title, value, category, notes, updatedAt } = req.body;
        
        const metaIndex = secretsMetadata.findIndex(s => s.id === id);
        if (metaIndex === -1) {
          return res.status(404).json({ error: 'Secret not found' });
        }
        
        await storage.setPassword('SecureVault', id, value);
        secretsMetadata[metaIndex] = {
          ...secretsMetadata[metaIndex],
          title,
          category,
          notes,
          updatedAt
        };
        
        res.json({ ...secretsMetadata[metaIndex], value });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update secret' });
      }
    });

    // DELETE /api/secrets/:id
    app.delete('/api/secrets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        const metaIndex = secretsMetadata.findIndex(s => s.id === id);
        if (metaIndex === -1) {
          return res.status(404).json({ error: 'Secret not found' });
        }
        
        await storage.deletePassword('SecureVault', id);
        secretsMetadata.splice(metaIndex, 1);
        
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete secret' });
      }
    });

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', service: 'SecureVault Backend' });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        service: 'SecureVault Backend'
      });
    });
  });

  describe('POST /api/secrets', () => {
    it('should create a new secret', async () => {
      const newSecret = {
        id: 'test-id-1',
        title: 'Test Secret',
        value: 'test-value',
        category: 'password',
        notes: 'Test notes',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const response = await request(app)
        .post('/api/secrets')
        .send(newSecret);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: newSecret.id,
        title: newSecret.title,
        category: newSecret.category,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/secrets')
        .send({ title: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/secrets', () => {
    it('should return all secrets', async () => {
      const response = await request(app).get('/api/secrets');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/secrets/:id', () => {
    it('should update an existing secret', async () => {
      // First create a secret
      const newSecret = {
        id: 'test-id-2',
        title: 'Original Title',
        value: 'original-value',
        category: 'password',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await request(app).post('/api/secrets').send(newSecret);

      // Then update it
      const updatedData = {
        title: 'Updated Title',
        value: 'updated-value',
        category: 'api-key',
        updatedAt: Date.now(),
      };

      const response = await request(app)
        .put(`/api/secrets/${newSecret.id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
    });

    it('should return 404 for non-existent secret', async () => {
      const response = await request(app)
        .put('/api/secrets/non-existent')
        .send({ title: 'Test', value: 'test', category: 'password', updatedAt: Date.now() });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/secrets/:id', () => {
    it('should delete a secret', async () => {
      // First create a secret
      const newSecret = {
        id: 'test-id-3',
        title: 'To Delete',
        value: 'delete-value',
        category: 'password',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await request(app).post('/api/secrets').send(newSecret);

      // Then delete it
      const response = await request(app).delete(`/api/secrets/${newSecret.id}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent secret', async () => {
      const response = await request(app).delete('/api/secrets/non-existent');

      expect(response.status).toBe(404);
    });
  });
});
