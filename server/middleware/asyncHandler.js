/*We use this to wrap async route handlers and controllers
1) It catches errors thrown by the async functions
2) It passes them to the Express's next() error handling middleware
*/
export const asyncHandler = (fn) => (req,res,next) => {
    Promise.resolve(fn(req,res,next)).catch(next);
};
