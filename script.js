// Global state
let selectedVillagers = [];
const MAX_SELECTIONS = 3;

// Text content - hardcoded for easy editing
const textContent = {
    pageTitle: "Species Complex Needs Diagram",
    header: {
        title: "Species Complex Needs Diagram",
        subtitle: "Select 3 species to view the corresponding diagram"
    },
    sections: {
        villagers: {
            title: "Species",
            selectionInfo: "/ 3 selected"
        },
        diagram: {
            title: "Venn Diagram",
            placeholder: {
                icon: "📊",
                message: "Select exactly 3 species to view the diagram"
            },
            errorMessage: "Diagram not found for selected species"
        }
    },
    villagers: {
        namePrefix: "Species",
        altTextPrefix: "Species",
        names: ["Humans", "Beavers", "Lizards", "Harpies", "Foxes", "Frogs", "Bats"]
    },
    notifications: {
        maxSelections: "You can only select up to 3 species"
    },
    diagrams: {
        altTextPrefix: "Diagram for species"
    }
};

// DOM elements
const villagersGrid = document.getElementById('villagersGrid');
const diagramContainer = document.getElementById('diagramContainer');
const selectionCount = document.getElementById('selectionCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateTextContent();
    loadVillagers();
    updateSelectionCount();
});

// Populate all text content
function populateTextContent() {
    // Update page title
    document.title = textContent.pageTitle;
    
    // Update all elements with data-text attributes
    document.querySelectorAll('[data-text]').forEach(element => {
        const textPath = element.getAttribute('data-text');
        const textValue = getNestedValue(textContent, textPath);
        if (textValue !== undefined) {
            element.textContent = textValue;
        }
    });
}

// Helper function to get nested object values by path (e.g., "header.title")
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

// Load villagers from the villagers folder
function loadVillagers() {
    const villagerNumbers = [0, 1, 2, 3, 4, 5, 6]; // Based on the files we saw
    
    villagerNumbers.forEach(number => {
        const villagerCard = createVillagerCard(number);
        villagersGrid.appendChild(villagerCard);
    });
}

// Create a villager card element
function createVillagerCard(villagerNumber) {
    const card = document.createElement('div');
    card.className = 'villager-card';
    card.dataset.villagerId = villagerNumber;
    
    // Get villager name from the names array
    const villagerName = textContent.villagers.names[villagerNumber] || `Villager ${villagerNumber}`;
    const altText = `${textContent.villagers.altTextPrefix} ${villagerNumber}`;
    
    card.innerHTML = `
        <img src="villagers/${villagerNumber}.png" alt="${altText}" class="villager-image" loading="lazy">
        <div class="villager-name">${villagerName}</div>
        <div class="selection-dot"></div>
    `;
    
    // Add click event listener
    card.addEventListener('click', () => toggleVillagerSelection(villagerNumber, card));
    
    return card;
}

// Toggle villager selection
function toggleVillagerSelection(villagerId, cardElement) {
    const isSelected = selectedVillagers.includes(villagerId);
    
    if (isSelected) {
        // Deselect villager
        selectedVillagers = selectedVillagers.filter(id => id !== villagerId);
        cardElement.classList.remove('selected');
    } else {
        // Check if we can select more villagers
        if (selectedVillagers.length >= MAX_SELECTIONS) {
            showNotification(textContent.notifications.maxSelections);
            return;
        }
        
        // Select villager
        selectedVillagers.push(villagerId);
        cardElement.classList.add('selected');
    }
    
    updateSelectionCount();
    updateDiagram();
}

// Update the selection count display
function updateSelectionCount() {
    selectionCount.textContent = selectedVillagers.length;
}

// Update the diagram display
function updateDiagram() {
    if (selectedVillagers.length === MAX_SELECTIONS) {
        showDiagram();
    } else {
        showPlaceholder();
    }
}

// Show the appropriate diagram
function showDiagram() {
    // Sort selected villagers to ensure consistent diagram mapping
    const sortedVillagers = selectedVillagers.sort((a, b) => a - b);
    const diagramName = sortedVillagers.join('');
    
    // Check if the diagram exists
    const diagramPath = `diagrams/${diagramName}.png`;
    
    // Create new image element
    const img = new Image();
    img.className = 'diagram-image';
    img.alt = `${textContent.diagrams.altTextPrefix} ${sortedVillagers.join(', ')}`;
    
    img.onload = function() {
        // Clear container and show diagram
        diagramContainer.innerHTML = '';
        diagramContainer.appendChild(img);
        diagramContainer.classList.add('showing-diagram');
    };
    
    img.onerror = function() {
        // If diagram doesn't exist, show error message
        showPlaceholder(textContent.sections.diagram.errorMessage);
    };
    
    img.src = diagramPath;
}

// Show placeholder message
function showPlaceholder(message = null) {
    const defaultMessage = textContent.sections.diagram.placeholder.message;
    const icon = textContent.sections.diagram.placeholder.icon;
    
    diagramContainer.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">${icon}</div>
            <p>${message || defaultMessage}</p>
        </div>
    `;
    diagramContainer.classList.remove('showing-diagram');
}

// Show notification message
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#e53e3e',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        fontSize: '0.9rem',
        fontWeight: '500'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Clear all selections
        selectedVillagers = [];
        document.querySelectorAll('.villager-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        updateSelectionCount();
        updateDiagram();
    }
});

// Add touch support for mobile devices
document.addEventListener('touchstart', function() {}, {passive: true});

// Performance optimization: Debounce diagram updates
let diagramUpdateTimeout;
function debouncedUpdateDiagram() {
    clearTimeout(diagramUpdateTimeout);
    diagramUpdateTimeout = setTimeout(updateDiagram, 100);
}

// Error handling for image loading
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.warn('Failed to load image:', e.target.src);
        e.target.style.display = 'none';
    }
}, true); 