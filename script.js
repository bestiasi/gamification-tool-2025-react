const GameModules = {
    points: {
        current: localStorage.getItem('gamePoints') || 0,
        addPoints: function(amount) {
            this.current = Math.max(0, parseInt(this.current) + amount);
            localStorage.setItem('gamePoints', this.current);
            document.getElementById('pointsDisplay').textContent = this.current;
            GameModules.progress.update(this.current);
            GameModules.achievements.check();
        }
    },
    
    progress: {
        target: 100,
        update: function(points) {
            const progress = Math.min((points / this.target) * 100, 100);
            document.getElementById('progressBar').style.width = `${progress}%`;
        }
    },
    
    achievements: {
        badges: [
            {id: 1, title: 'First Steps', desc: 'Earn 10 points', condition: 10, unlocked: false},
            {id: 2, title: 'Halfway There', desc: 'Reach 50 points', condition: 50, unlocked: false},
            {id: 3, title: 'Master', desc: 'Reach 100 points', condition: 100, unlocked: false}
        ],
        
        check: function() {
            this.badges.forEach(badge => {
                if(!badge.unlocked && GameModules.points.current >= badge.condition) {
                    badge.unlocked = true;
                    this.displayBadges();
                }
            });
        },
        
        displayBadges: function() {
            const container = document.getElementById('badgesContainer');
            container.innerHTML = this.badges.map(badge => `
                <div class="col-md-4">
                    <div class="card badge-card ${badge.unlocked ? '' : 'achievement-locked'}">
                        <div class="card-body">
                            <h5>${badge.title}</h5>
                            <p>${badge.desc}</p>
                            ${badge.unlocked ? '<span class="badge bg-success">Unlocked!</span>' : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
};

const TestRunner = {
    modules: {},

    registerModule: function(name, module) {
        this.modules[name] = module;
        console.log(`Module ${name} registered`);
    },

    runAllTests: function() {
        let output = '<div class="test-results">';
        for (const [name, module] of Object.entries(this.modules)) {
            output += `<article class="test-module"><h4>${name}</h4>`;
            output += module.runTests();
            output += '</article>';
        }
        output += '</div>';
        document.getElementById('output').innerHTML = output;
    }
};

// DEMO MODULE (Interns: Create similar structure for new features)
// Initialize game state
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pointsDisplay').textContent = GameModules.points.current;
    GameModules.progress.update(GameModules.points.current);
    GameModules.achievements.displayBadges();
});

function showSection(sectionId) {
    document.querySelectorAll('main, section').forEach(el => el.classList.add('d-none'));
    document.getElementById(sectionId).classList.remove('d-none');
}

TestRunner.registerModule('demo', {
    runTests: function() {
        return `
            <h3>Demo Results:</h3>
            <p>Case A: ${Math.random() > 0.5 ? 'pass' : 'fail'}</p>
            <p>Case B: ${Math.random() > 0.5 ? 'pass' : 'fail'}</p>
        `;
    }
});

// TEMPLATE FOR NEW MODULES (Copy/paste and modify)
/*
TestRunner.registerModule('dataDump', {
    init: function() {
        this.counter = 1;
        this.formatted = true;
    },
    
    runTests: function() {
        return `
            <div class="data-dump">
                <div class="dump-controls">
                    <button onclick="TestRunner.modules.dataDump.generateNewData()">Generate Data</button>
                    <button onclick="TestRunner.modules.dataDump.toggleFormat()">Toggle Format</button>
                </div>
                <pre class="dump-output">${this.formatData(this.generateTestData())}</pre>
            </div>
        `;
    },
    generateTestData: function() {
        return {
            id: this.counter++,
            timestamp: new Date().toISOString(),
            values: Array.from({length: 5}, () => Math.floor(Math.random() * 100))
        };
    },
    formatData: function(data) {
        return this.formatted 
            ? JSON.stringify(data, null, 2) 
            : JSON.stringify(data);
    },
    toggleFormat: function() {
        this.formatted = !this.formatted;
        TestRunner.runAllTests();
    }
});
*/
TestRunner.registerModule('dataTable', {
    init: function() {
        this.data = Array.from({length: 10}, (_,i) => ({
            id: i+1,
            name: `Item ${i+1}`,
            value: Math.random().toFixed(2),
            category: ['A','B','C'][i%3]
        }));
    },
    
    runTests: function() {
        return `
            <div class="data-table">
                <input type="text" class="table-filter" placeholder="Filter items..." oninput="TestRunner.modules.dataTable.filterTable(this.value)">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTableRows()}
                    </tbody>
                </table>
            </div>
        `;
    },
    filterTable: function(query) {
        const filtered = this.data.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
        document.querySelector('.data-table tbody').innerHTML = this.renderTableRows(filtered);
    },
    renderTableRows: function(data = this.data) {
        return data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.value}</td>
                <td>${item.category}</td>
            </tr>
        `).join('');
    }
});
TestRunner.registerModule('inputForm', {
    init: function() {
        this.formData = {};
    },
    
    runTests: function() {
        return `
            <form class="test-form" onsubmit="return TestRunner.modules.inputForm.handleSubmit(event)">
                <div class="form-group">
                    <label>Test Case Name:</label>
                    <input type="text" name="caseName" required>
                </div>
                <div class="form-group">
                    <label>Test Type:</label>
                    <select name="testType">
                        <option value="api">API Test</option>
                        <option value="ui">UI Test</option>
                        <option value="load">Load Test</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Parameters (JSON):</label>
                    <textarea name="parameters" rows="3"></textarea>
                </div>
                <button type="submit">Run Test</button>
                <div class="form-preview"></div>
            </form>
        `;
    },
    handleSubmit: function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.formData = Object.fromEntries(formData.entries());
        document.querySelector('.form-preview').innerHTML = `
            <strong>Test Configuration:</strong>
            <pre>${JSON.stringify(this.formData, null, 2)}</pre>
        `;
        return false;
    }
});