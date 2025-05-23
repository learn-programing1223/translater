# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dynamic HTML-based chat interface for "Scan and Speak" - a customer service chatbot interface. The project consists of a single HTML file with JavaScript that presents a functional conversational UI for users to interact with a technical support bot about products and services. The interface will connect to a backend LLM service that processes user queries based on a database. A key feature is multilingual support through automatic language detection for both text and voice input.

## Architecture

- **Frontend**: `frontend.html` contains the HTML structure, CSS, and JavaScript for a dynamic application
- **Styling**: Uses Tailwind CSS via CDN for all styling with proper dark mode support
- **Fonts**: Inter and Noto Sans loaded from Google Fonts
- **Dynamic interface**: Includes JavaScript functionality to handle user input and display responses
- **Future Backend Integration**: Will connect to a backend LLM that responds based on a database

## Key Components

- **Header**: Navigation bar with Scan and Speak branding, fully functional theme toggle
- **Chat Interface**: Dynamic message bubbles showing conversation between Scan and Speak and user with profile avatars
- **Message History**: Ability to store and display the conversation history
- **User Input**: Text input field for users to type questions
- **Multilingual Voice Input**: Centered, larger microphone button that activates speech recognition to detect and process multiple languages automatically
- **Language Processing**: System to automatically detect and handle multiple languages for both text and voice input
- **Internationalization**: Support for displaying the interface and messages in the user's detected language

## Development Notes

Currently, the frontend needs to be converted from a static prototype to a dynamic application. The following changes are needed:

- Add JavaScript to handle user input and display it in the chat interface
- Implement a message display system that shows both user messages and bot responses
- Create a proper dark mode toggle that correctly styles all elements when switched
- Center and enlarge the microphone button for better visibility and usability
- Implement speech recognition functionality with automatic language detection
- Structure the code to easily connect with a backend API in the future

The dark mode implementation should ensure all elements remain visible and properly styled when toggled, fixing the current issue where some elements don't change color appropriately.

## Implementation Guidelines

1. Use JavaScript to capture and display user input
2. Implement proper event listeners for the chat form submission
3. Create a message rendering function that handles both user and bot messages
4. Fix the dark mode toggle to properly update all relevant CSS classes
5. Position the microphone icon centrally and increase its size
6. Implement the Web Speech API for speech recognition with language detection:
   - Use `SpeechRecognition` interface with `lang` set to 'auto' or multiple language options
   - Implement Google's Speech Recognition API or another open-source alternative
   - Add visual feedback during voice recording
   - Process recognized speech in multiple languages
   - Display user's spoken input in the detected language
7. Structure the code to allow for easy backend integration later

React can be used as an alternative to vanilla HTML/JavaScript if preferred, as it may provide better state management for the chat interface.