

Research Assistant
==================

This project is a research assistant powered by OpenAI-compatible APIs. It allows you to leverage the power of large language models to assist with your research tasks.

Project Structure
-----------------

The project is divided into two main folders:

*   **`backend`**: Contains the server-side code built with Express.js. This handles API requests, interacts with the OpenAI API, and serves data to the frontend.
*   **`frontend`**: Contains the client-side code built with React.js. This provides the user interface for interacting with the research assistant.

Setup Instructions
------------------

To get the project up and running, follow these steps:

### Backend Setup (`backend` folder)

1.  **Navigate to the backend folder:**
    
        cd backend
    
2.  **Install dependencies:**
    
        npm install
    
3.  **Create `.env` file:**
    
    Create a file named `.env` in the `backend` folder and add the following environment variables:
    
        OPENAI_API_KEY=YOUR_OPENAI_API_KEY
        OPENAI_BASE_URL=YOUR_OPENAI_BASE_URL (Optional, if using a custom OpenAI compatible API endpoint)
        CORE_API_KEY=YOUR_CORE_API_KEY
        PORT=5000
        
    
    **Important:**
    
    *   Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key or the API key for your compatible service.
    *   If you are using a custom OpenAI compatible API endpoint (like a local proxy or a different service), replace `YOUR_OPENAI_BASE_URL` with the base URL of that endpoint. Otherwise, you can leave it blank to use the default OpenAI API endpoint.
    *   `CORE_API_KEY` is optional and depends on whether your backend logic requires an additional API key for internal services or security. If not needed, you can leave it blank.
    *   `PORT=5000` sets the port for the backend server to run on. You can change this if needed.
4.  **Start the backend server in development mode:**
    
        npm run dev
    
    This will start the backend server, typically on [http://localhost:5000](http://localhost:5000).
    

### Frontend Setup (`frontend` folder)

1.  **Navigate to the frontend folder:**
    
        cd ../frontend
    
    (Assuming you are currently in the `backend` folder)
    
2.  **Install dependencies:**
    
        npm install
    
3.  **Start the frontend application:**
    
        npm start
    
    This will start the React development server, usually opening the application in your browser at [http://localhost:3000](http://localhost:3000).
    

Running the Application
-----------------------

Once both the backend and frontend are running, you should be able to access the Research Assistant application in your browser at [http://localhost:3000](http://localhost:3000). The frontend will communicate with the backend server running on [http://localhost:5000](http://localhost:5000) to provide the research assistant functionality.

License
-------

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).

Show Your Support
-----------------

If you find this project helpful or interesting, please consider showing your support:

*   **Star this repository** on GitHub to help others discover it! ⭐
   [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/AsaBizanjo)
    
*  Buy me a coffee to support the development and maintenance of this project! 
