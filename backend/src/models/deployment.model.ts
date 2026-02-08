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
        enum: ['PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING', 'FAILED', 'ROLLED_BACK'],
        default: 'PENDING'
    },
    events: [{
        state: {
            type: String,
            enum: ['PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING', 'FAILED', 'ROLLED_BACK']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
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

// Middleware to automatically add an event when status changes
deploymentSchema.pre('save', function (this: any, next: any) {
    if (this.isModified('status')) {
        this.events.push({
            state: this.status,
            timestamp: new Date()
        });
    }
    next();
});

const Deployment = mongoose.model('Deployment', deploymentSchema);

export default Deployment;
