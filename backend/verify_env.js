require('dotenv').config();

const key = process.env.MAPTILER_API_KEY;

if (!key) {
    console.log("MAPTILER_API_KEY is MISSING");
} else {
    console.log("MAPTILER_API_KEY is Present (Length: " + key.length + ")");

    // Check for common placeholders
    const placeholders = ["INSERT_YOUR_KEY", "YOUR_API_KEY", "MAPTILER_KEY", "CHANGE_ME", "API_KEY_HERE"];
    const isPlaceholder = placeholders.some(p => key.toUpperCase().includes(p));

    if (isPlaceholder) {
        console.log("ALARM: The key appears to be a placeholder!");
    } else {
        console.log("The key does not look like a common placeholder.");
    }
}
