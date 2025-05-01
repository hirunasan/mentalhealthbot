// Replace the model loading part with this:
async function loadModel() {
  console.log('Loading AI model...');
  try {
    // Using a more powerful model
    pipe = await pipeline('text-generation', 'Xenova/gpt2-medium');
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
    process.exit(1);
  }
}
