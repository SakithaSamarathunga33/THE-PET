// Function to create a rounded version of the icon
function createRoundIcon() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert to favicon
        const link = document.querySelector("link[rel*='icon']");
        link.href = canvas.toDataURL();
    };
    
    img.src = '/images/white2.png';
}

// Run when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createRoundIcon);
} else {
    createRoundIcon();
}
