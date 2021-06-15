const currentLevel = process.env.LOG_LEVEL || 'INFO';

const logLevels = {
  ERROR: 0,
  INFO: 1,
  DETAIL: 2
};

module.exports = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  if (level === 'ERROR') {
    console.error(`${timestamp} ${level}: ${message}`);
  } else if (logLevels[level] <= logLevels[currentLevel]) {
    console.log(`${timestamp} ${level}: ${message}`);
  }
};
