export class EnvironmentValidator {
  static validateRequired(): void {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'ZIMTRA_API_KEY',
      'TICKETSOURCE_API_KEY',
      'GETSTREAM_API_KEY',
      'BREVO_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  static validateFormat(): void {
    // Validate URL formats
    const urls = ['DATABASE_URL', 'SUPABASE_URL', 'ZIMTRA_API_URL'];
    urls.forEach(key => {
      const value = process.env[key];
      if (value && !this.isValidUrl(value)) {
        throw new Error(`Invalid URL format for ${key}: ${value}`);
      }
    });

    // Validate port number
    const port = parseInt(process.env.PORT || '3001', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${process.env.PORT}`);
    }

    // Validate JWT secrets minimum length
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }
  }

  private static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}