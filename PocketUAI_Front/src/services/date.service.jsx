import { Timestamp } from "firebase/firestore"; // Importa Timestamp

// This service provides utility functions for handling and converting dates
// It includes methods for formatting dates as strings, converting between 
// Firebase Timestamps and JavaScript Date objects, and getting the month and year
// from a Date object.

export class DateService {
    static monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    /**
     * Get the month and year from a given Date object
     * @param {Date} date - JavaScript Date object
     * @returns {string} - Formatted date as "Month Year" (e.g., "January 2024")
     */
    static getMonthYear(date) {
        if (!(date instanceof Date)) {
            throw new Error("Invalid date provided");
        }
        return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }

    /**
     * Convert a Firebase timestamp to a JavaScript Date object
     * @param {Object | number} timestamp - Firebase timestamp object or Unix timestamp
     * @returns {Date} - JavaScript Date object
     */
    static convertToJSDate(timestamp) {
        if (!timestamp) return null;

        if (timestamp instanceof Timestamp) {
            return timestamp.toDate();
        }

        if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
            const firebaseTimestamp = new Timestamp(timestamp.seconds, timestamp.nanoseconds);
            return firebaseTimestamp.toDate();
        }

        throw new Error("Invalid timestamp format");
    }

    /**
     * Convert a JavaScript Date object to Firebase timestamp format
     * @param {Date} jsDate - JavaScript Date object
     * @returns {Object} - Firebase timestamp format { seconds: number, nanoseconds: number }
     */
    static convertToFirebaseTimestamp(jsDate) {
        if (!(jsDate instanceof Date)) {
            throw new Error("Invalid date provided");
        }

        return Timestamp.fromDate(jsDate);
    }
}
