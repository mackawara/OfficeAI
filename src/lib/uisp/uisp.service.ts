import axios from 'axios';
import { logger } from '../logger';
import { UispClient } from './types';

export interface ClientFilter {
  hasPaymentSubscription?: boolean;
  isLead?: boolean;
  isActive?: boolean;
  hasOverdueInvoice?: boolean;
}

export async function fetchClients(filter?: ClientFilter): Promise<UispClient[]> {
  const baseUrl = process.env.UISP_API_BASE_URL;
  const apiKey = process.env.UISP_API_KEY;

  if (!baseUrl || !apiKey) {
    logger.error('UISP API base URL or API key is not set in environment variables.');
    throw new Error('UISP API configuration missing');
  }

  try {
    logger.info('Fetching clients from UISP API...');
    const response = await axios.get(`${baseUrl}/clients`, {
      headers: {
        'x-auth-token': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    let clients: UispClient[] = response.data;
    if (filter) {
      clients = clients.filter(client => {
        if (filter.hasPaymentSubscription !== undefined && client.hasPaymentSubscription !== filter.hasPaymentSubscription) {
          return false;
        }
        if (filter.isLead !== undefined && client.isLead !== filter.isLead) {
          return false;
        }
        if (filter.isActive !== undefined && client.isActive !== filter.isActive) {
          return false;
        }
        if (filter.hasOverdueInvoice !== undefined && client.hasOverdueInvoice !== filter.hasOverdueInvoice) {
          return false;
        }
        return true;
      });
      logger.info(`Filtered clients count: ${clients.length}`);
    }

    return clients;
  } catch (error: any) {
    logger.error('Failed to fetch clients from UISP API:', error);
    throw new Error('Failed to fetch clients from UISP API');
  }
} 