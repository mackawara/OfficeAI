interface FacebookAPIError {
    response: {
      data: {
        error: {
          message: string;
          fbtrace_id?: string;
          error_data?: {
            details?: string;
          };
        };
      };
    };
  }
 const isFacebookAPIError = (error: unknown): error is FacebookAPIError => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as FacebookAPIError).response === 'object' &&
      'data' in (error as FacebookAPIError).response &&
      'error' in (error as FacebookAPIError).response.data
    );
  };
  export default {
    isFacebookAPIError
  }