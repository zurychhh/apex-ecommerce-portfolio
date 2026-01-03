/**
 * Unit tests for email.server.ts
 * Tests email sending functions with mocked Resend client
 */

// Mock logger FIRST (hoisted)
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerDebug = jest.fn();

jest.mock('../../app/utils/logger.server', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mockLoggerError,
    warn: mockLoggerWarn,
    debug: mockLoggerDebug,
  },
}));

// Get mocked Resend
const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

import {
  sendAnalysisCompleteEmail,
  sendWeeklySummaryEmail,
  sendWelcomeEmail,
} from '../../app/utils/email.server';

describe('Email Server Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ id: 'test-email-id' });
  });

  describe('sendAnalysisCompleteEmail', () => {
    it('should send email with correct recipient', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 5);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
        })
      );
    });

    it('should include recommendations count in subject', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 7);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('7 recommendations'),
        })
      );
    });

    it('should include recommendations count in HTML body', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 12);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('12 actionable recommendations'),
        })
      );
    });

    it('should send from correct sender', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 5);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'ConversionAI <notifications@conversionai.app>',
        })
      );
    });

    it('should log success message', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 5);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('Sending analysis complete email')
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('Email sent successfully')
      );
    });

    it('should not throw on error - graceful degradation', async () => {
      mockSend.mockRejectedValue(new Error('Resend API error'));

      // Should not throw
      await expect(
        sendAnalysisCompleteEmail('test@example.com', 5)
      ).resolves.not.toThrow();
    });

    it('should log error when sending fails', async () => {
      const error = new Error('Resend API error');
      mockSend.mockRejectedValue(error);

      await sendAnalysisCompleteEmail('test@example.com', 5);

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to send email:',
        error
      );
    });

    it('should include call to action link', async () => {
      await sendAnalysisCompleteEmail('test@example.com', 5);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('View Recommendations'),
        })
      );
    });
  });

  describe('sendWeeklySummaryEmail', () => {
    const mockData = {
      implementedCount: 3,
      pendingCount: 7,
      metricsImprovement: 5.5,
    };

    it('should send email with correct recipient', async () => {
      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
        })
      );
    });

    it('should include correct subject', async () => {
      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Weekly CRO Summary 📊',
        })
      );
    });

    it('should include implemented count in HTML', async () => {
      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Implemented: 3 recommendations'),
        })
      );
    });

    it('should include pending count in HTML', async () => {
      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Pending: 7 recommendations'),
        })
      );
    });

    it('should include positive metrics improvement with plus sign', async () => {
      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('+5.5%'),
        })
      );
    });

    it('should include negative metrics without plus sign', async () => {
      const negativeData = { ...mockData, metricsImprovement: -2.5 };
      await sendWeeklySummaryEmail('test@example.com', negativeData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('-2.5%'),
        })
      );
    });

    it('should include zero metrics without plus sign', async () => {
      const zeroData = { ...mockData, metricsImprovement: 0 };
      await sendWeeklySummaryEmail('test@example.com', zeroData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('0%'),
        })
      );
    });

    it('should not throw on error - graceful degradation', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        sendWeeklySummaryEmail('test@example.com', mockData)
      ).resolves.not.toThrow();
    });

    it('should log error when sending fails', async () => {
      const error = new Error('API error');
      mockSend.mockRejectedValue(error);

      await sendWeeklySummaryEmail('test@example.com', mockData);

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to send weekly summary:',
        error
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send email with correct recipient', async () => {
      await sendWelcomeEmail('test@example.com', 'test-store.myshopify.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
        })
      );
    });

    it('should include correct subject', async () => {
      await sendWelcomeEmail('test@example.com', 'test-store.myshopify.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to ConversionAI! 👋',
        })
      );
    });

    it('should include shop domain in HTML', async () => {
      await sendWelcomeEmail('test@example.com', 'my-awesome-store.myshopify.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('my-awesome-store.myshopify.com'),
        })
      );
    });

    it('should include onboarding steps', async () => {
      await sendWelcomeEmail('test@example.com', 'test-store.myshopify.com');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('Run your first store analysis');
      expect(callArgs.html).toContain('Review your prioritized recommendations');
      expect(callArgs.html).toContain('Implement quick wins');
    });

    it('should include call to action button', async () => {
      await sendWelcomeEmail('test@example.com', 'test-store.myshopify.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Start First Analysis'),
        })
      );
    });

    it('should not throw on error - graceful degradation', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        sendWelcomeEmail('test@example.com', 'test.myshopify.com')
      ).resolves.not.toThrow();
    });

    it('should log error when sending fails', async () => {
      const error = new Error('API error');
      mockSend.mockRejectedValue(error);

      await sendWelcomeEmail('test@example.com', 'test.myshopify.com');

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to send welcome email:',
        error
      );
    });
  });
});
