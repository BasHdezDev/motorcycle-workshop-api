import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };

    const mockRequest = {
        url: '/drivers/123',
    };

    const mockHost = {
        switchToHttp: () => ({
            getResponse: () => mockResponse,
            getRequest: () => mockRequest,
        }),
    } as unknown as ArgumentsHost;

    beforeEach(() => {
        jest.clearAllMocks();
        filter = new HttpExceptionFilter();
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should format an HttpException with a string message', () => {
        const exception = new BadRequestException('Invalid input');

        filter.catch(exception, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockResponse.send).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.BAD_REQUEST,
                path: '/drivers/123',
                message: 'Invalid input',
            }),
        );
    });

    it('should format an HttpException with an array message (e.g. validation errors)', () => {
        const exception = new BadRequestException(['firstName should not be empty']);

        filter.catch(exception, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockResponse.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: ['firstName should not be empty'],
            }),
        );
    });

    it('should default to 500 and a generic message for non-HTTP exceptions', () => {
        const exception = new Error('Unexpected failure');

        filter.catch(exception, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(mockResponse.send).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Unexpected failure',
            }),
        );
    });

    it('should include a timestamp in the response', () => {
        const exception = new BadRequestException('Invalid input');

        filter.catch(exception, mockHost);

        const sentBody = mockResponse.send.mock.calls[0][0];
        expect(sentBody.timestamp).toBeDefined();
        expect(new Date(sentBody.timestamp).toString()).not.toBe('Invalid Date');
    });
});