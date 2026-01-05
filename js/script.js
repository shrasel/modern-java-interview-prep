document.addEventListener('DOMContentLoaded', async () => {
    const sidebarList = document.getElementById('sidebar-list');
    const contentArea = document.getElementById('content-area');
    const emptyState = document.getElementById('empty-state');
    
    // Mobile Layout Elements
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.getElementById('main-container');
    const mobileBackBtn = document.getElementById('mobile-back-btn');
    
    let activeId = null;
    let interviewData = [];

    // Define Chapters
    const chapters = [
        { title: "Core Foundations", range: [1, 26], id: "ch1" },
        { title: "Collections & Generics", range: [27, 51], id: "ch2" },
        { title: "Functional Java", range: [52, 76], id: "ch3" },
        { title: "Concurrency", range: [77, 101], id: "ch4" }
    ];

    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        interviewData = await response.json();
        
        // Initialize Sidebar
        renderSidebar();

        // Select first item by default (Desktop only)
        if (interviewData.length > 0 && window.innerWidth >= 768) {
            selectQuestion(interviewData[0].id);
        }
    } catch (error) {
        console.error('Error loading interview data:', error);
        contentArea.innerHTML = `<div class="text-red-500 p-4">Error loading data. Please check the console or try refreshing the page.</div>`;
    }

    // Mobile Back Button Handler
    if (mobileBackBtn) {
        mobileBackBtn.addEventListener('click', () => {
            sidebar.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        });
    }

    function renderSidebar() {
        sidebarList.innerHTML = '';
        
        chapters.forEach((chapter, index) => {
            // Create Chapter Header
            const chapterHeader = document.createElement('div');
            chapterHeader.className = 'sticky top-0 bg-slate-900/95 backdrop-blur z-10 py-3 px-2 border-b border-slate-800 mb-2 mt-4 first:mt-0';
            chapterHeader.innerHTML = `
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Chapter ${index + 1}</h3>
                <div class="text-sm font-semibold text-slate-200">${chapter.title}</div>
            `;
            sidebarList.appendChild(chapterHeader);

            // Filter questions for this chapter
            const chapterQuestions = interviewData.filter(q => q.id >= chapter.range[0] && q.id <= chapter.range[1]);

            chapterQuestions.forEach(item => {
                const btn = document.createElement('button');
                btn.className = `w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group flex items-start gap-3 hover:bg-slate-800 border border-transparent mb-1`;
                btn.setAttribute('data-id', item.id);
                
                btn.innerHTML = `
                    <span class="font-mono text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition-colors min-w-[1.5rem]">${String(item.id).padStart(2, '0')}</span>
                    <span class="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors line-clamp-2">${item.question}</span>
                `;

                btn.addEventListener('click', () => selectQuestion(item.id));
                sidebarList.appendChild(btn);
            });
        });
    }

    function selectQuestion(id) {
        activeId = id;

        // Handle Mobile View Toggle
        if (window.innerWidth < 768) {
            sidebar.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            // Scroll to top of content
            mainContainer.scrollTop = 0;
        }

        // Update Sidebar UI
        document.querySelectorAll('#sidebar-list button').forEach(btn => {
            const btnId = parseInt(btn.getAttribute('data-id'));
            if (btnId === id) {
                btn.classList.remove('hover:bg-slate-800', 'border-transparent');
                btn.classList.add('bg-blue-500/10', 'border-blue-500/20');
                btn.querySelector('span:last-child').classList.remove('text-slate-400');
                btn.querySelector('span:last-child').classList.add('text-blue-400');
                btn.querySelector('span:first-child').classList.add('text-blue-500');
                
                // Scroll sidebar to keep active item in view
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                btn.classList.add('hover:bg-slate-800', 'border-transparent');
                btn.classList.remove('bg-blue-500/10', 'border-blue-500/20');
                btn.querySelector('span:last-child').classList.add('text-slate-400');
                btn.querySelector('span:last-child').classList.remove('text-blue-400');
                btn.querySelector('span:first-child').classList.remove('text-blue-500');
            }
        });

        // Update Content Area
        const data = interviewData.find(item => item.id === id);
        if (!data) return;

        emptyState.classList.add('hidden');
        contentArea.classList.remove('hidden');
        
        // Animate content change
        contentArea.classList.remove('fade-in');
        void contentArea.offsetWidth; // Trigger reflow
        contentArea.classList.add('fade-in');

        const codeBlock = data.code ? `
            <div class="mt-8">
                <div class="flex items-center justify-between px-4 py-2 bg-slate-900 rounded-t-lg border border-slate-800 border-b-0">
                    <span class="text-xs font-mono text-slate-500">Example.java</span>
                    <div class="flex gap-1.5">
                        <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    </div>
                </div>
                <pre class="bg-slate-950 p-0 rounded-b-lg border border-slate-800 overflow-hidden text-sm font-mono leading-relaxed text-slate-300 shadow-2xl shadow-black/50"><code class="language-java p-6 block">${escapeHtml(data.code)}</code></pre>
            </div>
        ` : '';

        // Find current chapter for breadcrumb
        const currentChapter = chapters.find(c => id >= c.range[0] && id <= c.range[1]);

        contentArea.innerHTML = `
            <div class="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500">
                <span class="uppercase tracking-wider">Chapter ${chapters.indexOf(currentChapter) + 1}</span>
                <span class="text-slate-700">/</span>
                <span class="text-blue-500">Question ${String(data.id).padStart(2, '0')}</span>
            </div>
            
            <h2 class="text-3xl md:text-4xl font-bold text-slate-100 mb-4 leading-tight">${data.question}</h2>
            <p class="text-lg text-slate-500 font-light italic mb-10 border-l-2 border-slate-800 pl-4">${data.alt}</p>
            
            <div class="prose prose-invert prose-lg max-w-none text-slate-300">
                ${data.answer}
            </div>

            ${codeBlock}

            ${data.footer ? data.footer : ''}
        `;

        // Apply syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});
