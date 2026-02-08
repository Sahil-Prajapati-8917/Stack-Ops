import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['web', 'worker', 'cron'],
        default: 'web'
    },
    runtime: {
        type: String,
        enum: ['node', 'python', 'go', 'docker'],
        default: 'node'
    },
    replicas: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['running', 'stopped', 'failed', 'deploying'],
        default: 'stopped'
    },
    env: [{
        key: String,
        value: String
    }]
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
