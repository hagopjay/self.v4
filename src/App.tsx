import React from 'react';
import SelfMapVisualization from './components/SelfMapVisualization';

// Example data
const sampleData = {
  "Professional": {
    "Strength": 8,
    "Title": "Software Engineer",
    "Beliefs": "Continuous learning and innovation",
    "Style": "Analytical and methodical"
  },
  "Creative": {
    "Strength": 7,
    "Title": "Artist",
    "Beliefs": "Expression and originality",
    "Style": "Experimental"
  },
  "Social": {
    "Strength": 6,
    "Title": "Friend & Mentor",
    "Beliefs": "Building meaningful connections",
    "Style": "Empathetic"
  },
  "Physical": {
    "Strength": 5,
    "Title": "Health Enthusiast",
    "Beliefs": "Balance and wellness",
    "Style": "Active"
  },
  "Intellectual": {
    "Strength": 9,
    "Title": "Lifelong Learner",
    "Beliefs": "Knowledge is power",
    "Style": "Curious and systematic"
  }
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <SelfMapVisualization data={sampleData} />
      </div>
    </div>
  );
}

export default App;