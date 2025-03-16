import os
import base64
import logging
from google.cloud import documentai_v1 as documentai
from google.oauth2 import service_account
from google.api_core.exceptions import InvalidArgument

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for maximum verbosity
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('GoogleDocAIClient')


class SimpleGoogleAPIClient:
    """
    A simple client for interacting with Google Document AI API using the official
    google-cloud-documentai Python client library.
    """
    
    def __init__(self, credentials_path=None, project_id="161834410341", location="us", processor_id="70bb36ae806d4e58"):
        """
        Initialize the client with Google API credentials.
        
        Args:
            credentials_path (str): Path to the service account JSON file.
            project_id (str): Google Cloud Project ID.
            location (str): Processing location (e.g., "us", "eu").
            processor_id (str): Document AI processor ID.
        """
        self.project_id = project_id
        self.location = location
        self.processor_id = processor_id
        self.client = None
        
        # Store the resource name for the processor
        self.processor_name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"
        logger.info(f"Initializing Document AI client for processor: {self.processor_name}")
        
        if credentials_path:
            self.load_credentials(credentials_path)
    
    def load_credentials(self, credentials_path):
        """
        Load Google API credentials and initialize the Document AI client.
        
        Args:
            credentials_path (str): Path to the service account JSON file.
        """
        logger.info(f"Loading credentials from: {credentials_path}")
        
        # Check if file exists
        if not os.path.exists(credentials_path):
            error_msg = f"Credentials file does not exist at path: {credentials_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
        
        try:
            # Create credentials from the service account file
            credentials = service_account.Credentials.from_service_account_file(credentials_path)
            
            # Initialize the Document AI client with the credentials
            self.client = documentai.DocumentProcessorServiceClient(credentials=credentials)
            logger.info("✓ Document AI client initialized successfully")
            
        except Exception as e:
            error_msg = f"Failed to initialize Document AI client: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def process_document(self, file_content=None, mime_type="image/jpeg"):
        """
        Process a document using Google Document AI API.
        
        Args:
            file_content (bytes): Raw content of the document.
            mime_type (str): MIME type of the document.
            
        Returns:
            dict: Processed document information.
        """
        if self.client is None:
            error_msg = "Document AI client not initialized. Call load_credentials() first."
            logger.error(error_msg)
            raise Exception(error_msg)
        
        # Ensure content is bytes
        if isinstance(file_content, str):
            file_content = file_content.encode('utf-8')
            logger.debug("Converted string content to bytes")
            
        logger.info(f"Processing document with mime type: {mime_type}")
        
        if not file_content:
            logger.warning("Document content is empty or None")
        
        try:
            # Create the process request with detailed error handling
            raw_document = documentai.RawDocument(
                content=file_content,
                mime_type=mime_type
            )
            
            # Use the low-level API to match the exact payload structure
            request = documentai.ProcessRequest(
                name=self.processor_name,
                raw_document=raw_document
            )
            
            # Add process options with OCR config
            request.process_options = documentai.ProcessOptions()
            request.process_options.ocr_config = documentai.OcrConfig()
            request.process_options.ocr_config.hints = documentai.OcrConfig.Hints(
                language_hints=["en", "us"]
            )
            
            # Set imageless mode
            request.imageless_mode = True
            
            # Debug: Log request details (excluding binary content)
            logger.debug(f"Request processor name: {request.name}")
            logger.debug(f"Request mime type: {request.raw_document.mime_type}")
            logger.debug(f"Request imageless_mode: {request.imageless_mode}")
            logger.debug(f"Request language hints: {request.process_options.ocr_config.hints.language_hints}")
            
            # Process the document
            result = self.client.process_document(request=request)
            logger.info("✓ Document processed successfully")
            
            return result
            
        except InvalidArgument as e:
            error_msg = f"Invalid argument error: {str(e)}"
            logger.error(error_msg)
            logger.error("This usually means the request format is incorrect or a required field is missing/invalid")
            
            # Provide more detailed debugging information
            if "mime_type" in str(e).lower():
                logger.error("Check the mime_type - it might be invalid or unsupported")
            elif "content" in str(e).lower():
                logger.error("The document content may be corrupted or in an unsupported format")
            
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Failed to process document: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def simple_request(self, content=None, mime_type="image/jpeg"):
        """
        Send a simple request to Google Document AI API with minimal configuration.
        This method focuses on matching the exact request format you specified.
        
        Args:
            content (bytes): Document content.
            mime_type (str): MIME type of the document.
            
        Returns:
            dict: Processed document information.
        """
        if self.client is None:
            error_msg = "Document AI client not initialized. Call load_credentials() first."
            logger.error(error_msg)
            raise Exception(error_msg)
        
        # Ensure content is bytes
        if isinstance(content, str) and content:
            content = content.encode('utf-8')
            logger.debug("Converted string content to bytes")
        
        # If content is None or empty, use empty bytes
        if not content:
            content = b""
            logger.warning("Using empty content for request")
            
        logger.info(f"Sending simple request with mime type: {mime_type}")
        
        try:
            # Create a raw document object
            raw_document = documentai.RawDocument(
                content=content,
                mime_type=mime_type
            )
            
            # Create process options with OCR config exactly matching your format
            ocr_config = documentai.OcrConfig()
            ocr_config.hints = documentai.OcrConfig.Hints(
                language_hints=["en", "us"]
            )
            
            process_options = documentai.ProcessOptions(
                ocr_config=ocr_config
            )
            
            # Build the complete request
            request = documentai.ProcessRequest(
                name=self.processor_name,
                raw_document=raw_document,
                process_options=process_options,
                imageless_mode=True
            )
            
            # Log what we're sending
            logger.debug(f"Request processor name: {request.name}")
            logger.debug(f"Request mime type: {request.raw_document.mime_type}")
            logger.debug(f"Request has content: {'Yes' if content else 'No'}")
            logger.debug(f"Request imageless_mode: {request.imageless_mode}")
            logger.debug(f"Request language hints: {request.process_options.ocr_config.hints.language_hints}")
            
            # Process the document
            result = self.client.process_document(request=request)
            logger.info("✓ Simple request processed successfully")
            
            return result
            
        except InvalidArgument as e:
            error_msg = f"Invalid argument error: {str(e)}"
            logger.error(error_msg)
            logger.error("Common causes of 400 errors:")
            logger.error("1. Processor ID doesn't exist or is incorrect")
            logger.error("2. The mime_type is not supported by this processor")
            logger.error("3. Empty document content with imageless_mode=True")
            logger.error("4. Project/location doesn't match the processor ID")
            
            # Try to extract details from the error message
            if "Resource has been exhausted" in str(e):
                logger.error("Your project may have exceeded API quota limits")
            elif "Permission denied" in str(e):
                logger.error("Service account lacks permission to use this processor")
            
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Failed to process simple request: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)


# Example testing function to debug issues
def test_client(credentials_path, test_file=None):
    """Test the client with various configurations to identify the issue."""
    client = SimpleGoogleAPIClient(credentials_path=credentials_path)
    
    # Test 1: Simple empty request
    try:
        logger.info("TEST 1: Simple empty request")
        result = client.simple_request(content=b"", mime_type="application/pdf")
        logger.info("✓ Test 1 succeeded")
    except Exception as e:
        logger.error(f"✗ Test 1 failed: {str(e)}")
    
    # Test 2: With a real document if provided
    if test_file and os.path.exists(test_file):
        try:
            logger.info(f"TEST 2: Processing real document: {test_file}")
            with open(test_file, "rb") as f:
                content = f.read()
                # Get mime type based on file extension
                ext = os.path.splitext(test_file)[1].lower()
                mime_type = "image/jpeg"  # Default
                if ext == ".pdf":
                    mime_type = "application/pdf"
                elif ext in [".png"]:
                    mime_type = "image/png"
                    
                result = client.simple_request(content=content, mime_type=mime_type)
                logger.info("✓ Test 2 succeeded")
        except Exception as e:
            logger.error(f"✗ Test 2 failed: {str(e)}")


# Example usage
if __name__ == "__main__":
    # Replace with your credentials path
    creds_path = "path/to/your/credentials.json"
    
    # Optional: path to a test document
    test_document = None  # "path/to/test/document.pdf"
    
    # Run tests
    test_client(creds_path, test_document)