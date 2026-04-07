// Initialize state from LocalStorage or use empty array
let employees = JSON.parse(localStorage.getItem('employees')) || [];

// DOM Elements
const tableBody = document.getElementById('employee-table-body');
const emptyState = document.getElementById('empty-state');
const tableWrapper = document.querySelector('.table-wrapper');

// Modal Elements
const modal = document.getElementById('employee-modal');
const form = document.getElementById('employee-form');
const btnAddEmployee = document.getElementById('btn-add-employee');
const btnEmptyAdd = document.getElementById('btn-empty-add');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const modalTitle = document.getElementById('modal-title');

// Form Inputs
const empIdInput = document.getElementById('emp-id');
const empNameInput = document.getElementById('emp-name');
const empEmailInput = document.getElementById('emp-email');
const empRoleInput = document.getElementById('emp-role');
const empDeptInput = document.getElementById('emp-dept');
const empStatusInput = document.getElementById('emp-status');

// Search & Stats
const searchInput = document.getElementById('search-input');
const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statLeave = document.getElementById('stat-leave');

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Generate dummy data if local storage is completely empty on first visit
    if(employees.length === 0 && !localStorage.getItem('firstVisitTracked')) {
        employees = [
            { id: generateId(), name: "Sarah Connor", email: "sarah.c@nexus.com", role: "Software Engineer", dept: "Engineering", status: "Active", date: formatDate(new Date()) },
            { id: generateId(), name: "John Smith", email: "john.s@nexus.com", role: "Product Manager", dept: "Product", status: "Active", date: formatDate(new Date()) },
            { id: generateId(), name: "Mike Johnson", email: "mike.j@nexus.com", role: "UX Designer", dept: "Design", status: "On Leave", date: formatDate(new Date()) }
        ];
        saveEmployees();
        localStorage.setItem('firstVisitTracked', 'true');
    }
    renderEmployees(employees);
});

// Event Listeners
btnAddEmployee.addEventListener('click', () => openModal());
btnEmptyAdd.addEventListener('click', () => openModal());
btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit();
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = employees.filter(emp => {
        return emp.name.toLowerCase().includes(searchTerm) || 
               emp.email.toLowerCase().includes(searchTerm) ||
               emp.role.toLowerCase().includes(searchTerm) ||
               emp.dept.toLowerCase().includes(searchTerm);
    });
    renderEmployees(filtered);
});

// Helpers
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function updateStats() {
    statTotal.textContent = employees.length;
    statActive.textContent = employees.filter(e => e.status === 'Active').length;
    statLeave.textContent = employees.filter(e => e.status === 'On Leave').length;
}

function saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(employees));
    updateStats();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal Logic
function openModal(editId = null) {
    modal.classList.add('active');
    
    if (editId) {
        modalTitle.textContent = "Edit Employee";
        const emp = employees.find(e => e.id === editId);
        if (emp) {
            empIdInput.value = emp.id;
            empNameInput.value = emp.name;
            empEmailInput.value = emp.email;
            empRoleInput.value = emp.role;
            empDeptInput.value = emp.dept;
            empStatusInput.value = emp.status;
        }
    } else {
        modalTitle.textContent = "Add New Employee";
        form.reset();
        empIdInput.value = "";
    }
}

function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => form.reset(), 300); // wait for animation
}

// Form Submission (Add / Edit)
function handleFormSubmit() {
    const id = empIdInput.value;
    const newEmployee = {
        id: id || generateId(),
        name: empNameInput.value,
        email: empEmailInput.value,
        role: empRoleInput.value,
        dept: empDeptInput.value,
        status: empStatusInput.value,
        date: id ? employees.find(e => e.id === id).date : formatDate(new Date())
    };

    if (id) {
        // Update existing
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = newEmployee;
            showToast("Employee details updated.");
        }
    } else {
        // Add new
        employees.push(newEmployee);
        showToast("New employee added successfully.");
    }

    saveEmployees();
    renderEmployees(employees);
    closeModal();
    
    // Clear search if active
    if(searchInput.value) {
        searchInput.value = '';
        renderEmployees(employees);
    }
}

// Delete Logic
window.deleteEmployee = function(id) {
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
        employees = employees.filter(e => e.id !== id);
        saveEmployees();
        renderEmployees(employees);
        showToast("Employee removed entirely.");
    }
}

// Edit Link (Attach to global window for onclick)
window.editEmployee = function(id) {
    openModal(id);
}

// Render Logic
function renderEmployees(dataList) {
    updateStats();
    tableBody.innerHTML = '';

    if (dataList.length === 0) {
        tableWrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableWrapper.style.display = 'block';
    emptyState.style.display = 'none';

    dataList.forEach(emp => {
        const tr = document.createElement('tr');
        
        // CSS class names for status styling map directly if we remove spaces
        const statusClass = emp.status.replace(/\s+/g, '');
        
        tr.innerHTML = `
            <td>
                <div class="emp-cell-content">
                    <div class="emp-avatar">${getInitials(emp.name)}</div>
                    <div class="emp-info">
                        <span class="emp-name">${emp.name}</span>
                        <span class="emp-email">${emp.email}</span>
                    </div>
                </div>
            </td>
            <td><span class="emp-role">${emp.role}</span></td>
            <td><span class="emp-dept">${emp.dept}</span></td>
            <td>
                <span class="status-badge status-${statusClass}">${emp.status}</span>
            </td>
            <td><span class="emp-date">${emp.date}</span></td>
            <td class="actions-cell">
                <button class="action-btn" onclick="editEmployee('${emp.id}')" title="Edit">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="action-btn delete" onclick="deleteEmployee('${emp.id}')" title="Delete">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}
