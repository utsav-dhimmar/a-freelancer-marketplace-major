import { connectDB, disconnectDB } from '../db/index.js';
import { contractService } from '../services/contracts.service.js';

const runScript = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log('[SCRIPT] Starting contract creation process...');

    // 2. Call the service method
    const { created, skipped } = await contractService.createContractsForAcceptedProposals();

    console.log(`[SCRIPT] Finished! Created: ${created}, Skipped: ${skipped}.`);
  } catch (error) {
    console.error('[SCRIPT] Error creating contracts:', error);
  } finally {
    // 3. Disconnect from DB
    await disconnectDB();
  }
};

runScript();
