module.exports = async (req, res) => {
  console.log('Test API called');
  return res.json({ message: 'Test API is working!', timestamp: new Date().toISOString() });
};
