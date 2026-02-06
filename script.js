class ResearchPaperSearch {
    constructor() {
        this.currentPage = 1;
        this.totalResults = 0;
        this.searchHistory = [];
        this.currentResults = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSearchHistory();
    }
    
    bindEvents() {
        // Search button click
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        
        // Enter key in search input
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        // Quick topic buttons
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topic = e.target.dataset.topic;
                document.getElementById('searchInput').value = topic;
                this.performSearch();
            });
        });
        
        // Pagination
        document.getElementById('prevBtn').addEventListener('click', () => this.prevPage());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        
        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('paperModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('paperModal')) {
                this.closeModal();
            }
        });
    }
    
    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
        // Save to history
        this.addToSearchHistory(query);
        
        // Get filters
        const filters = this.getFilters();
        
        // Simulate API call (in real implementation, call actual APIs)
        await this.simulateSearch(query, filters);
        
        // Update UI
        this.updateResultsUI();
        this.showLoading(false);
    }
    
    getFilters() {
        return {
            yearFrom: document.getElementById('yearFrom').value,
            yearTo: document.getElementById('yearTo').value,
            sortBy: document.getElementById('sortBy').value,
            databases: Array.from(document.querySelectorAll('input[name="database"]:checked'))
                .map(db => db.value)
        };
    }
    
    async simulateSearch(query, filters) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data
        this.currentResults = this.generateMockResults(query, filters);
        this.totalResults = 42; // Mock total
        
        this.updateFiltersDisplay(filters);
    }
    
    generateMockResults(query, filters) {
        const mockTitles = [
            `A Comprehensive Study of ${query} in Modern Applications`,
            `Deep Learning Approaches for ${query}`,
            `${query}: Recent Advances and Future Directions`,
            `The Impact of ${query} on Computational Methods`,
            `Novel Techniques in ${query} Research`,
            `Comparative Analysis of ${query} Methodologies`,
            `${query} and its Applications in Healthcare`,
            `Survey of ${query} Approaches`
        ];
        
        const mockAuthors = [
            "Smith, J.; Johnson, A.; Williams, R.",
            "Chen, L.; Wang, H.; Zhang, Y.",
            "Miller, T.; Brown, K.; Davis, M.",
            "Garcia, M.; Rodriguez, P.; Martinez, S.",
            "Kim, S.; Park, J.; Lee, H.",
            "Taylor, B.; Anderson, C.; Thomas, E."
        ];
        
        const mockAbstract = `This paper presents a comprehensive analysis of ${query}, exploring various methodologies and applications. The research investigates key challenges and proposes novel solutions that demonstrate significant improvements over existing approaches. Our findings suggest promising directions for future work in this rapidly evolving field.`;
        
        const results = [];
        const resultsPerPage = 10;
        const startIndex = (this.currentPage - 1) * resultsPerPage;
        
        for (let i = 0; i < resultsPerPage; i++) {
            const year = 2015 + Math.floor(Math.random() * 9);
            const citations = Math.floor(Math.random() * 500);
            
            results.push({
                id: `paper-${startIndex + i + 1}`,
                title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
                authors: mockAuthors[Math.floor(Math.random() * mockAuthors.length)],
                abstract: mockAbstract,
                year: year,
                citations: citations,
                source: filters.databases[Math.floor(Math.random() * filters.databases.length)],
                url: `https://arxiv.org/abs/${Date.now()}-${i}`,
                doi: `10.1234/arxiv.${Date.now()}-${i}`,
                pdfUrl: `https://arxiv.org/pdf/${Date.now()}-${i}.pdf`
            });
        }
        
        // Apply sorting
        this.applySorting(results, filters.sortBy);
        
        return results;
    }
    
    applySorting(results, sortBy) {
        switch (sortBy) {
            case 'newest':
                results.sort((a, b) => b.year - a.year);
                break;
            case 'oldest':
                results.sort((a, b) => a.year - b.year);
                break;
            case 'citations':
                results.sort((a, b) => b.citations - a.citations);
                break;
            default:
                // relevance (default) - keep as is
                break;
        }
    }
    
    updateResultsUI() {
        const container = document.getElementById('resultsContainer');
        const countElement = document.getElementById('resultsCount');
        const statsElement = document.getElementById('resultsStats');
        const pagination = document.getElementById('pagination');
        
        // Update counts
        const start = (this.currentPage - 1) * 10 + 1;
        const end = Math.min(start + 9, this.totalResults);
        countElement.textContent = `Search Results for "${document.getElementById('searchInput').value}"`;
        statsElement.textContent = `Showing ${start}-${end} of ${this.totalResults} papers`;
        
        // Clear previous results
        container.innerHTML = '';
        
        // Show results
        if (this.currentResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No Results Found</h3>
                    <p>Try different keywords or adjust your filters.</p>
                </div>
            `;
            pagination.style.display = 'none';
            return;
        }
        
        // Add paper cards
        this.currentResults.forEach(paper => {
            const paperCard = this.createPaperCard(paper);
            container.appendChild(paperCard);
        });
        
        // Show pagination
        pagination.style.display = 'flex';
        this.updatePaginationButtons();
    }
    
    createPaperCard(paper) {
        const card = document.createElement('div');
        card.className = 'paper-card';
        card.dataset.id = paper.id;
        
        card.innerHTML = `
            <h3 class="paper-title">${paper.title}</h3>
            <div class="paper-authors">${paper.authors}</div>
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="paper-meta">
                <div class="paper-info">
                    <span><i class="fas fa-calendar"></i> ${paper.year}</span>
                    <span><i class="fas fa-quote-right"></i> ${paper.citations} citations</span>
                    <span><i class="fas fa-database"></i> ${paper.source.toUpperCase()}</span>
                </div>
                <div class="paper-actions">
                    <button class="action-btn view-details" data-id="${paper.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="action-btn primary view-pdf" data-url="${paper.pdfUrl}">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-details').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPaperDetails(paper);
        });
        
        card.querySelector('.view-pdf').addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(paper.pdfUrl, '_blank');
        });
        
        card.addEventListener('click', () => this.showPaperDetails(paper));
        
        return card;
    }
    
    showPaperDetails(paper) {
        const modal = document.getElementById('paperModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="modal-section">
                <h3>Title</h3>
                <p>${paper.title}</p>
            </div>
            <div class="modal-section">
                <h3>Authors</h3>
                <p>${paper.authors}</p>
            </div>
            <div class="modal-section">
                <h3>Abstract</h3>
                <p>${paper.abstract}</p>
            </div>
            <div class="modal-section">
                <h3>Publication Details</h3>
                <p><strong>Year:</strong> ${paper.year}</p>
                <p><strong>Citations:</strong> ${paper.citations}</p>
                <p><strong>Source:</strong> ${paper.source.toUpperCase()}</p>
                <p><strong>DOI:</strong> ${paper.doi}</p>
            </div>
            <div class="modal-actions">
                <button class="action-btn primary" onclick="window.open('${paper.pdfUrl}', '_blank')">
                    <i class="fas fa-file-pdf"></i> View PDF
                </button>
                <button class="action-btn" onclick="window.open('${paper.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> Source Page
                </button>
                <button class="action-btn" onclick="this.copyDOI('${paper.doi}')">
                    <i class="fas fa-copy"></i> Copy DOI
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    copyDOI(doi) {
        navigator.clipboard.writeText(doi).then(() => {
            alert(`DOI copied to clipboard: ${doi}`);
        });
    }
    
    closeModal() {
        document.getElementById('paperModal').style.display = 'none';
    }
    
    updatePaginationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage * 10 >= this.totalResults;
        pageInfo.textContent = `Page ${this.currentPage}`;
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.performSearch();
        }
    }
    
    nextPage() {
        if (this.currentPage * 10 < this.totalResults) {
            this.currentPage++;
            this.performSearch();
        }
    }
    
    updateFiltersDisplay(filters) {
        const container = document.getElementById('filtersApplied');
        container.innerHTML = '';
        
        if (filters.yearFrom || filters.yearTo) {
            const yearFilter = document.createElement('div');
            yearFilter.className = 'filter-tag';
            yearFilter.innerHTML = `
                <i class="fas fa-calendar"></i>
                Years: ${filters.yearFrom || 'Any'} - ${filters.yearTo || 'Any'}
                <button onclick="this.removeYearFilter()">&times;</button>
            `;
            container.appendChild(yearFilter);
        }
        
        if (filters.sortBy && filters.sortBy !== 'relevance') {
            const sortFilter = document.createElement('div');
            sortFilter.className = 'filter-tag';
            sortFilter.innerHTML = `
                <i class="fas fa-sort-amount-down"></i>
                Sorted by: ${filters.sortBy}
                <button onclick="this.removeSortFilter()">&times;</button>
            `;
            container.appendChild(sortFilter);
        }
    }
    
    removeYearFilter() {
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        this.performSearch();
    }
    
    removeSortFilter() {
        document.getElementById('sortBy').value = 'relevance';
        this.performSearch();
    }
    
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const stats = document.getElementById('resultsStats');
        
        if (show) {
            spinner.style.display = 'flex';
            stats.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            stats.style.display = 'block';
        }
    }
    
    addToSearchHistory(query) {
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        this.saveSearchHistory();
    }
    
    saveSearchHistory() {
        localStorage.setItem('researchSearchHistory', JSON.stringify(this.searchHistory));
    }
    
    loadSearchHistory() {
        const saved = localStorage.getItem('researchSearchHistory');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const searchApp = new ResearchPaperSearch();
    
    // Make methods available globally for inline onclick handlers
    window.copyDOI = (doi) => searchApp.copyDOI(doi);
    window.removeYearFilter = () => searchApp.removeYearFilter();
    window.removeSortFilter = () => searchApp.removeSortFilter();
});