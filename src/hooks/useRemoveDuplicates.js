export const removeDuplicates = (arr, prop1, prop2) => {
    const result = [];
    const seen = new Set();

    for (const obj of arr) {
        // Create a string representation of the object using the two properties
        const key = obj[prop1] + obj[prop2];

        // Check if the string representation (key) is in the Set
        if (!seen.has(key)) {
            seen.add(key); // Add the key to the Set to mark it as seen
            result.push(obj); // Add the object to the result array
        }
    }

    return result;
}
