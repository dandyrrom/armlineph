// src/components/SimpleVideoEmbed.jsx
function SimpleVideoEmbed({ videoUrl }) {
    if (!videoUrl) return null;
  
    // Basic URL validation and formatting
    const cleanUrl = videoUrl.trim();
    
    // YouTube embed detection
    const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
    
    // Google Drive detection
    const isGoogleDrive = cleanUrl.includes('drive.google.com');
    
    // Basic URL validation
    const isValidUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
  
    if (!isValidUrl) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Invalid video URL format</p>
          <p className="text-red-600 text-xs mt-1">URL should start with http:// or https://</p>
        </div>
      );
    }
  
    // YouTube Embed
    if (isYouTube) {
      let videoId = '';
      
      // Extract video ID from various YouTube URL formats
      if (cleanUrl.includes('youtube.com/watch?v=')) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0];
      } else if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
      }
  
      if (videoId) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">YouTube Video</h4>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-64 rounded-lg border-0"
              ></iframe>
            </div>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Open in YouTube ↗
            </a>
          </div>
        );
      }
    }
  
    // Google Drive Embed
    if (isGoogleDrive) {
      let fileId = '';
      
      // Extract file ID from Google Drive URL
      if (cleanUrl.includes('/file/d/')) {
        fileId = cleanUrl.split('/file/d/')[1]?.split('/')[0];
      } else if (cleanUrl.includes('id=')) {
        fileId = cleanUrl.split('id=')[1]?.split('&')[0];
      }
  
      if (fileId) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Google Drive Video</h4>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://drive.google.com/file/d/${fileId}/preview`}
                title="Google Drive video player"
                className="w-full h-64 rounded-lg border-0"
              ></iframe>
            </div>
            <div className="flex gap-2 mt-2">
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Open in Google Drive ↗
              </a>
              <span className="text-gray-400">•</span>
              <a
                href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Download Video
              </a>
            </div>
          </div>
        );
      }
    }
  
    // Fallback for other video URLs
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">Video Evidence</h4>
        <div className="flex items-center justify-between bg-white border rounded-lg p-3">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Video Link</p>
              <p className="text-xs text-gray-500 truncate max-w-xs">{cleanUrl}</p>
            </div>
          </div>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Watch Video
          </a>
        </div>
      </div>
    );
  }
  
  export default SimpleVideoEmbed;