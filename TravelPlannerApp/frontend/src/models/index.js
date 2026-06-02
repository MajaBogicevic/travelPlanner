/**
 * @typedef {Object} TravelPlan
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} budget
 * @property {number} totalExpenses
 * @property {number} remainingBudget
 * @property {Destination[]} destinations
 * @property {Activity[]} activities
 * @property {Expense[]} expenses
 * @property {ChecklistItem[]} checklistItems
 */

/**
 * @typedef {Object} Destination
 * @property {number} id
 * @property {string} name
 * @property {string|null} location
 * @property {string} arrivalDate
 * @property {string} departureDate
 * @property {string|null} description
 */

/**
 * @typedef {Object} Activity
 * @property {number} id
 * @property {string} name
 * @property {string} date
 * @property {string|null} time
 * @property {string|null} location
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {number|null} estimatedCost
 * @property {'Planned'|'Reserved'|'Completed'|'Cancelled'} status
 */

/**
 * @typedef {Object} Expense
 * @property {number} id
 * @property {string} name
 * @property {string} category
 * @property {number} amount
 * @property {string} date
 * @property {string|null} description
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {number} id
 * @property {string} text
 * @property {boolean} isCompleted
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} role
 */