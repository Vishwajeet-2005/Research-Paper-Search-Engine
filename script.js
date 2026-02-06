class ResearchPaperSearch {
    constructor() {
        this.currentPage = 1;
        this.totalResults = 0;
        this.totalPages = 0;
        this.searchHistory = [];
        this.currentResults = [];
        this.currentQuery = '';
        this.currentFilters = {};
        
        // CrossRef API Configuration
        this.crossrefConfig = {
            baseUrl: 'https://api.crossref.org/works',
            mailto: 'vishwajeetsurvase28@gmail.com', // Your email for polite usage
            rows: 20, // Default rows per page
            timeout: 10000 // 10 second timeout
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSearchHistory();
        this.updateEmptyState();
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
        
        // Results per page change
        document.getElementById('resultsPerPage').addEventListener('change', () => {
            this.currentPage = 1;
            if (this.currentQuery) {
                this.performSearch();
            }
        });
    }
    
    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
            this.showMessage('Please enter a search term', 'warning');
            return;
        }
        
        this.currentQuery = query;
        this.currentPage = 1;
        
        // Show loading
        this.showLoading(true);
        
        // Save to history
        this.addToSearchHistory(query);
        
        // Get filters
        const filters = this.getFilters();
        this.currentFilters = filters;
        
        // Perform real API search
        try {
            await this.searchCrossRef(query, filters);
        } catch (error) {
            this.handleSearchError(error);
        }
        
        // Update UI
        this.updateResultsUI();
        this.showLoading(false);
    }
    
    getFilters() {
        const yearFrom = document.getElementById('yearFrom').value;
        const yearTo = document.getElementById('yearTo').value;
        
        return {
            yearFrom: yearFrom,
            yearTo: yearTo,
            sortBy: document.getElementById('sortBy').value,
            resultsPerPage: parseInt(document.getElementById('resultsPerPage').value)
        };
    }
    
    async searchCrossRef(query, filters) {
        // Build query parameters
        const params = new URLSearchParams({
            query: query,
            rows: filters.resultsPerPage || this.crossrefConfig.rows,
            offset: (this.currentPage - 1) * (filters.resultsPerPage || this.crossrefConfig.rows),
            mailto: this.crossrefConfig.mailto,
            select: 'DOI,title,author,abstract,published-print,published-online,is-referenced-by-count,URL,subject,container-title'
        });
        
        // Add sorting
        if (filters.sortBy === 'newest') {
            params.append('sort', 'published');
            params.append('order', 'desc');
        } else if (filters.sortBy === 'oldest') {
            params.append('sort', 'published');
            params.append('order', 'asc');
        }
        
        // Add year filter if provided
        if (filters.yearFrom || filters.yearTo) {
            let yearFilter = '';
            if (filters.yearFrom) yearFilter += filters.yearFrom;
            yearFilter += '-';
            if (filters.yearTo) yearFilter += filters.yearTo;
            params.append('filter', `from-pub-date:${yearFilter}`);
        }
        
        // Show loading with query info
        document.getElementById('resultsStats').textContent = `Searching for "${query}"...`;
        
        // Make API request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.crossrefConfig.timeout);
        
        try {
            const response = await fetch(`${this.crossrefConfig.baseUrl}?${params}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Update results
            this.currentResults = this.parseCrossRefResults(data.message.items || []);
            this.totalResults = data.message['total-results'] || 0;
            this.totalPages = Math.ceil(this.totalResults / (filters.resultsPerPage || this.crossrefConfig.rows));
            
            // Update filters display
            this.updateFiltersDisplay(filters);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    }
    
    parseCrossRefResults(items) {
        return items.map((item, index) => {
            // Extract year from publication date
            let year = 'N/A';
            if (item['published-print'] && item['published-print']['date-parts']) {
                year = item['published-print']['date-parts'][0][0];
            } else if (item['published-online'] && item['published-online']['date-parts']) {
                year = item['published-online']['date-parts'][0][0];
            }
            
            // Extract authors
            let authors = 'Unknown authors';
            if (item.author && item.author.length > 0) {
                authors = item.author.map(author => {
                    if (author.given && author.family) {
                        return `${author.given} ${author.family}`;
                    } else if (author.name) {
                        return author.name;
                    }
                    return '';
                }).filter(name => name).join(', ');
            }
            
            // Extract title
            let title = 'Untitled';
            if (item.title && item.title.length > 0) {
                title = item.title[0];
            }
            
            // Extract abstract (if available)
            let abstract = 'No abstract available.';
            if (item.abstract) {
                // Remove HTML tags if present
                abstract = item.abstract.replace(/<[^>]*>/g, '');
            }
            
            // Get citation count
            const citations = item['is-referenced-by-count'] || 0;
            
            // Get journal name
            const journal = item['container-title'] && item['container-title'][0] ? item['container-title'][0] : 'Unknown Journal';
            
            // Generate PDF URL (not all papers have PDFs, but we can link to DOI)
            const pdfUrl = item.URL || `https://doi.org/${item.DOI}`;
            
            return {
                id: `paper-${index}-${item.DOI || Date.now()}`,
                title: title,
                authors: authors,
                abstract: abstract,
                year: year,
                citations: citations,
                source: 'crossref',
                url: item.URL || `https://doi.org/${item.DOI}`,
                doi: item.DOI || 'No DOI available',
                pdfUrl: pdfUrl,
                journal: journal,
                subjects: item.subject || [],
                demo: false // Real data from API
            };
        });
    }
    
    handleSearchError(error) {
        console.error('Search error:', error);
        this.showMessage(`Search failed: ${error.message}`, 'error');
        
        // Clear results
        this.currentResults = [];
        this.totalResults = 0;
        this.totalPages = 0;
    }
    
    showMessage(message, type = 'info') {
        const container = document.getElementById('resultsContainer');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `error-message ${type === 'error' ? 'error' : 'warning'}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <h3>${type === 'error' ? 'Error' : 'Notice'}</h3>
            <p>${message}</p>
            ${type === 'error' ? '<p>Please try a different search term or try again later.</p>' : ''}
        `;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
    }
    
    updateResultsUI() {
        const container = document.getElementById('resultsContainer');
        const countElement = document.getElementById('resultsCount');
        const statsElement = document.getElementById('resultsStats');
        const pagination = document.getElementById('pagination');
        
        // Update counts
        const resultsPerPage = parseInt(document.getElementById('resultsPerPage').value);
        const start = (this.currentPage - 1) * resultsPerPage + 1;
        const end = Math.min(start + resultsPerPage - 1, this.totalResults);
        
        countElement.textContent = `Search Results for "${this.currentQuery}"`;
        statsElement.textContent = `Showing ${start}-${end} of ${this.totalResults.toLocaleString()} papers`;
        
        // Clear previous results
        container.innerHTML = '';
        
        // Show results or no results message
        if (this.currentResults.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No Results Found</h3>
                    <p>No papers found for "${this.currentQuery}". Try different keywords or adjust your filters.</p>
                    <div class="tips">
                        <h4>Search Suggestions:</h4>
                        <ul>
                            <li>Try more general keywords</li>
                            <li>Check spelling</li>
                            <li>Remove year filters</li>
                            <li>Search for specific authors</li>
                        </ul>
                    </div>
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
        
        // Show pagination if there are multiple pages
        if (this.totalPages > 1) {
            pagination.style.display = 'flex';
            this.updatePaginationButtons();
        } else {
            pagination.style.display = 'none';
        }
    }
    
    createPaperCard(paper) {
        const card = document.createElement('div');
        card.className = 'paper-card';
        card.dataset.id = paper.id;
        
        // Truncate abstract for card view
        const truncatedAbstract = paper.abstract.length > 250 
            ? paper.abstract.substring(0, 250) + '...' 
            : paper.abstract;
        
        card.innerHTML = `
            <h3 class="paper-title">${this.escapeHtml(paper.title)}</h3>
            <div class="paper-authors">${this.escapeHtml(paper.authors)}</div>
            <div class="paper-journal"><i class="fas fa-book"></i> ${this.escapeHtml(paper.journal)}</div>
            <p class="paper-abstract">${this.escapeHtml(truncatedAbstract)}</p>
            <div class="paper-meta">
                <div class="paper-info">
                    <span><i class="fas fa-calendar"></i> ${paper.year}</span>
                    <span><i class="fas fa-quote-right"></i> ${paper.citations} citations</span>
                    <span><i class="fas fa-database"></i> CrossRef</span>
                </div>
                <div class="paper-actions">
                    <button class="action-btn view-details" data-id="${paper.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="action-btn primary view-pdf" data-url="${paper.pdfUrl}">
                        <i class="fas fa-external-link-alt"></i> View
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
            if (paper.pdfUrl) {
                window.open(paper.pdfUrl, '_blank');
            }
        });
        
        card.addEventListener('click', () => this.showPaperDetails(paper));
        
        return card;
    }
    
    showPaperDetails(paper) {
        const modal = document.getElementById('paperModal');
        const modalBody = document.getElementById('modalBody');
        
        // Format subjects
        const subjectsHtml = paper.subjects && paper.subjects.length > 0 
            ? `<p><strong>Subjects:</strong> ${paper.subjects.join(', ')}</p>`
            : '';
        
        modalBody.innerHTML = `
            <div class="modal-section">
                <h3><i class="fas fa-book"></i> Title</h3>
                <p>${this.escapeHtml(paper.title)}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-users"></i> Authors</h3>
                <p>${this.escapeHtml(paper.authors)}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-newspaper"></i> Journal</h3>
                <p>${this.escapeHtml(paper.journal)}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-align-left"></i> Abstract</h3>
                <p>${this.escapeHtml(paper.abstract)}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> Publication Details</h3>
                <p><strong>Year:</strong> ${paper.year}</p>
                <p><strong>Citations:</strong> ${paper.citations}</p>
                <p><strong>Source:</strong> CrossRef</p>
                <p><strong>DOI:</strong> ${paper.doi}</p>
                ${subjectsHtml}
            </div>
            <div class="modal-actions">
                <button class="action-btn primary" id="viewPaperBtn">
                    <i class="fas fa-external-link-alt"></i> View Paper
                </button>
                <button class="action-btn" id="copyDoiBtn">
                    <i class="fas fa-copy"></i> Copy DOI
                </button>
                <button class="action-btn" id="citePaperBtn">
                    <i class="fas fa-quote-right"></i> Cite
                </button>
            </div>
        `;
        
        // Add event listeners for modal buttons
        modalBody.querySelector('#viewPaperBtn').addEventListener('click', () => {
            if (paper.url) window.open(paper.url, '_blank');
        });
        
        modalBody.querySelector('#copyDoiBtn').addEventListener('click', () => {
            this.copyDOI(paper.doi);
        });
        
        modalBody.querySelector('#citePaperBtn').addEventListener('click', () => {
            this.showCitation(paper);
        });
        
        modal.style.display = 'flex';
    }
    
    showCitation(paper) {
        // Generate APA citation
        const apaCitation = `${paper.authors.split(',')[0]}. (${paper.year}). ${paper.title}. ${paper.journal}.`;
        
        // Show citation in alert (could be enhanced with a modal)
        alert(`APA Citation:\n\n${apaCitation}\n\nDOI: ${paper.doi}`);
    }
    
    copyDOI(doi) {
        if (!doi || doi === 'No DOI available') {
            alert('No DOI available for this paper');
            return;
        }
        
        navigator.clipboard.writeText(doi).then(() => {
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = `DOI copied: ${doi}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-color);
                color: white;
                padding: 12px 24px;
                border-radius: var(--radius-md);
                z-index: 10000;
                box-shadow: var(--shadow-lg);
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy DOI:', err);
            alert(`Failed to copy DOI: ${doi}`);
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
        nextBtn.disabled = this.currentPage >= this.totalPages;
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.performSearchWithCurrentParams();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.performSearchWithCurrentParams();
        }
    }
    
    async performSearchWithCurrentParams() {
        this.showLoading(true);
        
        try {
            await this.searchCrossRef(this.currentQuery, this.currentFilters);
        } catch (error) {
            this.handleSearchError(error);
        }
        
        this.updateResultsUI();
        this.showLoading(false);
        
        // Scroll to top of results
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
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
                <button class="remove-year-filter">&times;</button>
            `;
            yearFilter.querySelector('.remove-year-filter').addEventListener('click', () => {
                this.removeYearFilter();
            });
            container.appendChild(yearFilter);
        }
        
        if (filters.sortBy && filters.sortBy !== 'relevance') {
            const sortFilter = document.createElement('div');
            sortFilter.className = 'filter-tag';
            sortFilter.innerHTML = `
                <i class="fas fa-sort-amount-down"></i>
                Sorted by: ${filters.sortBy}
                <button class="remove-sort-filter">&times;</button>
            `;
            sortFilter.querySelector('.remove-sort-filter').addEventListener('click', () => {
                this.removeSortFilter();
            });
            container.appendChild(sortFilter);
        }
    }
    
    removeYearFilter() {
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        this.currentFilters.yearFrom = '';
        this.currentFilters.yearTo = '';
        this.currentPage = 1;
        this.performSearchWithCurrentParams();
    }
    
    removeSortFilter() {
        document.getElementById('sortBy').value = 'relevance';
        this.currentFilters.sortBy = 'relevance';
        this.currentPage = 1;
        this.performSearchWithCurrentParams();
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
    
    updateEmptyState() {
        // Update initial empty state to show API status
        const container = document.getElementById('resultsContainer');
        if (container.children.length === 1) {
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) {
                emptyState.querySelector('.api-status').innerHTML = `
                    <h4><i class="fas fa-plug"></i> API Status: <span class="status-active">Connected</span></h4>
                    <p>Ready to search millions of academic papers via CrossRef API</p>
                    <p><small>Email for polite use: ${this.crossrefConfig.mailto}</small></p>
                `;
            }
        }
    }
    
    addToSearchHistory(query) {
        const now = new Date();
        const searchItem = {
            query: query,
            timestamp: now.toISOString(),
            displayTime: now.toLocaleString()
        };
        
        this.searchHistory.unshift(searchItem);
        this.searchHistory = this.searchHistory.slice(0, 20);
        this.saveSearchHistory();
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('researchSearchHistory', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.warn('Could not save search history:', e);
        }
    }
    
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('researchSearchHistory');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load search history:', e);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const searchApp = new ResearchPaperSearch();
    
    // Make copyDOI available globally
    window.copyDOI = (doi) => searchApp.copyDOI(doi);
});
