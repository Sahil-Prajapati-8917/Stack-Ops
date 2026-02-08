import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'building', 'deploying', 'success', 'failed'],
        default: 'pending'
    },
    logs: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        message: String
    }],
    commitHash: {
        type: String
    },
    version: {
        type: String
    }
}, {
    timestamps: true
});

const Deployment = mongoose.model('Deployment', deploymentSchema);

export default Deployment;
