import mongoose from 'mongoose';
import { Job } from '../model/job.model.js';
import { connectDB, disconnectDB } from '../db/index.js';

const migrate = async () => {
  try {
    await connectDB();

    console.log('Finding jobs without deadlines...');
    const jobs = await Job.find({ 
      $or: [
        { deadline: { $exists: false } },
        { deadline: null }
      ]
    });

    console.log(`Found ${jobs.length} jobs to update.`);

    for (const job of jobs) {
      // Random future date between 7 and 30 days from now
      const daysToAdd = Math.floor(Math.random() * (30 - 7 + 1)) + 7;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + daysToAdd);
      
      job.deadline = deadline;
      await job.save();
      console.log(`Updated job ${job._id} with deadline ${deadline.toLocaleDateString()}`);
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await disconnectDB();
  }
};

migrate();
