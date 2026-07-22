# AI Tooling Prompt History (PROMPTS.md)

This log catalogs the prompt flows and conversation history between the developer and AI assistants (ChatGPT and Antigravity) throughout the creation of the Car Dealership Inventory System.

---

## 1. Planning

**Developer Prompt:**
> "I want to build a Car Dealership Inventory System using the MERN stack. Help me plan out the modules, authentication flows, and inventory constraints following TDD. Let's outline the backend API paths and frontend views."

**AI Response Summary:**
- Proposed structure: Auth, Vehicles (Protected), Inventory (Protected).
- Recommended setting up MongoDB Memory Server for isolated Jest integration tests.
- Designed dashboard containing search filters and admin tools.

---

## 2. Architecture

**Developer Prompt:**
> "Let's define a Clean Architecture model for our MERN stack directory. Suggest how to decouple database logic, routing, request validation, and middlewares using SOLID principles."

**AI Response Summary:**
- Advised structuring models with Mongoose, controllers handling request validations, and middlewares handling authentication hooks separately.
- Advised using Mongoose virtual JSON transforms to map DB formats to API response standards cleanly.

---

## 3. Backend

**Developer Prompt:**
> "Generate the User model with email verification regex, and configure Express server entry points using modern ES Modules (type: module)."

**AI Response Summary:**
- Delivered `backend/src/models/User.js` containing bcrypt pre-save hooks and `matchPassword` methods.
- Drafted `backend/src/app.js` with CORS and JSON parsers.

---

## 4. Frontend

**Developer Prompt:**
> "Create a React SPA layout using Tailwind CSS. I want it to feel premium. Set up a state manager with React Context to handle user login, signup, and token caching."

**AI Response Summary:**
- Outlined `frontend/src/context/AuthContext.jsx` with Axios headers injection.
- Delivered a dark-mode styled dashboard grid for the fleet display.

---

## 5. Testing

**Developer Prompt:**
> "Write Red-phase integration tests for user register/login, vehicle additions and updates, and purchase transaction decrements. Use Jest and Supertest."

**AI Response Summary:**
- Generated complete test files: `auth.test.js`, `vehicles.test.js`, and `inventory.test.js` using isolated database test handlers.

---

## 6. Debugging

**Developer Prompt:**
> "My vehicle tests are failing with 400 validation errors because price and quantity parameters are coming in as strings from the client. Let's fix this in the controllers."

**AI Response Summary:**
- Recommended wrapping request parameters inside `Number(...)` check utilities inside `vehicleController.js` and `inventoryController.js`.

---

## 7. Refactoring

**Developer Prompt:**
> "Review my vehicle schema JSON transforms. I want the client response to return clean `id` properties instead of MongoDB's default `_id` and `__v` attributes."

**AI Response Summary:**
- Injected Mongoose schema options `toJSON` overrides doing `ret.id = ret._id.toString();` and deletion operations.

---

## 8. Documentation

**Developer Prompt:**
> "Create a README file for my dealership application. It should detail the setup, architecture, local run scripts, and a breakdown of my AI usage reflection."

**AI Response Summary:**
- Drafted an enterprise-grade Markdown file containing badges, mermaid diagrams, and table indicators.

---

## 9. Reflection

Working alongside ChatGPT for bootstrapping blueprints and Antigravity for running commands and Git rewriting allowed me to execute the TDD Kata in record time with robust, compile-ready coverage. The workflow effectively shows how modern AI assistants can be used to augment developer speed without compromising on engineering rigor.
