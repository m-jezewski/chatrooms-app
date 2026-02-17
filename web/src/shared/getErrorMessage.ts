export const getErrorMessage = (error: unknown): string | undefined => {
    if (error && typeof error === 'object') {
        if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
            return String(error.data.message);
        }
        if ('message' in error) {
            return String((error as { message: unknown }).message);
        }
    }
    return undefined;
}