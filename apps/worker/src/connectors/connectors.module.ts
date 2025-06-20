import { Module } from '@nestjs/common'
import { GoogleSheetsConnector } from './google-sheets-connector'

/**
 * ConnectorsModule - Registry of all data source connectors
 * 
 * This module provides a centralized location for all data connectors.
 * Each connector implements the anti-fragile patterns defined in BaseConnector:
 * 
 * - Circuit breaker protection
 * - Intelligent retry logic
 * - Comprehensive logging
 * - Health monitoring
 * 
 * Future connectors (Facebook Ads, LinkedIn, etc.) will be added here
 * while maintaining consistent behavior and observability standards.
 */
@Module({
  providers: [
    GoogleSheetsConnector,
    // Future connectors will be added here:
    // FacebookAdsConnector,
    // LinkedInAdsConnector,
    // SalesforceConnector,
    // HubSpotConnector,
  ],
  exports: [
    GoogleSheetsConnector,
    // Export future connectors here
  ],
})
export class ConnectorsModule {}