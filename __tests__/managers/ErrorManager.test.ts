import { ErrorManager } from '../../src/managers/ErrorManager';

describe('ErrorManager', () => {
    let errorManager: ErrorManager;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        errorManager = new ErrorManager({ container });
    });

    afterEach(() => {
        errorManager.destroy();
    });

    describe('initialization', () => {
        it('should create notifications container', () => {
            const notificationsElement = container.querySelector('.error-notifications');
            expect(notificationsElement).toBeTruthy();
        });
    });

    describe('showError', () => {
        it('should display error notification', () => {
            const errorHandler = jest.fn();
            errorManager.on('error:add', errorHandler);

            errorManager.showError('Test error message');

            const notification = container.querySelector('.notification.error');
            expect(notification).toBeTruthy();
            expect(notification?.textContent).toContain('Test error message');
            expect(errorHandler).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Test error message',
                type: 'error'
            }));
        });
    });

    describe('showWarning', () => {
        it('should display warning notification', () => {
            const errorHandler = jest.fn();
            errorManager.on('error:add', errorHandler);

            errorManager.showWarning('Test warning message');

            const notification = container.querySelector('.notification.warning');
            expect(notification).toBeTruthy();
            expect(notification?.textContent).toContain('Test warning message');
            expect(errorHandler).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Test warning message',
                type: 'warning'
            }));
        });
    });

    describe('showInfo', () => {
        it('should display info notification', () => {
            const errorHandler = jest.fn();
            errorManager.on('error:add', errorHandler);

            errorManager.showInfo('Test info message');

            const notification = container.querySelector('.notification.info');
            expect(notification).toBeTruthy();
            expect(notification?.textContent).toContain('Test info message');
            expect(errorHandler).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Test info message',
                type: 'info'
            }));
        });
    });

    describe('notification management', () => {
        it('should auto-hide notifications after timeout', () => {
            jest.useFakeTimers();

            errorManager.showError('Test error message');
            expect(container.querySelectorAll('.notification').length).toBe(1);

            jest.advanceTimersByTime(5000); // Default timeout
            expect(container.querySelectorAll('.notification').length).toBe(0);

            jest.useRealTimers();
        });

        it('should allow custom auto-hide timeout', () => {
            jest.useFakeTimers();

            errorManager.setAutoHideTimeout(2000);
            errorManager.showError('Test error message');
            
            jest.advanceTimersByTime(1999);
            expect(container.querySelectorAll('.notification').length).toBe(1);

            jest.advanceTimersByTime(1);
            expect(container.querySelectorAll('.notification').length).toBe(0);

            jest.useRealTimers();
        });

        it('should remove notification when close button clicked', () => {
            errorManager.showError('Test error message');
            const closeButton = container.querySelector('.notification .close') as HTMLElement;
            expect(closeButton).toBeTruthy();

            closeButton.click();
            expect(container.querySelectorAll('.notification').length).toBe(0);
        });

        it('should sort notifications by timestamp (newest first)', () => {
            errorManager.showError('First error');
            errorManager.showWarning('Second warning');
            errorManager.showInfo('Third info');

            const notifications = container.querySelectorAll('.notification');
            expect(notifications[0].textContent).toContain('Third info');
            expect(notifications[1].textContent).toContain('Second warning');
            expect(notifications[2].textContent).toContain('First error');
        });
    });

    describe('clear', () => {
        it('should remove all notifications', () => {
            const clearHandler = jest.fn();
            errorManager.on('error:clear', clearHandler);

            errorManager.showError('Error 1');
            errorManager.showError('Error 2');
            errorManager.showError('Error 3');

            expect(container.querySelectorAll('.notification').length).toBe(3);

            errorManager.clear();

            expect(container.querySelectorAll('.notification').length).toBe(0);
            expect(clearHandler).toHaveBeenCalled();
        });
    });

    describe('getNotifications', () => {
        it('should return all current notifications', () => {
            errorManager.showError('Error message');
            errorManager.showWarning('Warning message');
            errorManager.showInfo('Info message');

            const notifications = errorManager.getNotifications();
            expect(notifications).toHaveLength(3);
            expect(notifications[0].type).toBe('info');
            expect(notifications[1].type).toBe('warning');
            expect(notifications[2].type).toBe('error');
        });
    });

    describe('event emission', () => {
        it('should emit error:remove when notification is removed', () => {
            const removeHandler = jest.fn();
            errorManager.on('error:remove', removeHandler);

            errorManager.showError('Test error');
            const notification = errorManager.getNotifications()[0];
            const closeButton = container.querySelector('.notification .close') as HTMLElement;
            closeButton.click();

            expect(removeHandler).toHaveBeenCalledWith(notification.id);
        });
    });

    describe('destroy', () => {
        it('should clean up DOM elements and clear notifications', () => {
            errorManager.showError('Test error');
            expect(container.querySelector('.error-notifications')).toBeTruthy();
            expect(errorManager.getNotifications().length).toBe(1);

            errorManager.destroy();

            expect(container.querySelector('.error-notifications')).toBeFalsy();
            expect(errorManager.getNotifications().length).toBe(0);
        });
    });
});
