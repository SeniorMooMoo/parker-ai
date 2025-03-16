import re
import json
import os
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple, Any

class HandwritingAnalysisService:
  """Service handles analyzing handwriting samples."""
    
  def __init__(self):
      pass
      
  def status(self):
      return "Service is running."

  def load_document_ai_response(self, json_string_or_path):
      """Load Document AI JSON response from string or file path."""
      if isinstance(json_string_or_path, str):
          # Check if it's a file path or a JSON string
          if json_string_or_path.endswith('.json') or os.path.exists(json_string_or_path):
              with open(json_string_or_path, 'r') as f:
                  return json.load(f)
          else:
              # Assume it's a JSON string
              return json.loads(json_string_or_path)
      else:
          # Assume it's already a dict
          return json_string_or_path

  def extract_token_data(self, doc_ai_response: Dict) -> List[Dict[str, Any]]:
      """
      Extract token data from Document AI response, including:
      - Text content
      - Bounding box coordinates
      - Position in document
      """
      token_data = []
      
      # Check if we're dealing with the root response or just the document part
      if 'document' in doc_ai_response:
          document = doc_ai_response['document']
      else:
          document = doc_ai_response
      
      full_text = document.get('text', '')
      
      # Process each page
      for page in document.get('pages', []):
          page_number = page.get('pageNumber', 1)
          page_height = page.get('dimension', {}).get('height', 0)
          page_width = page.get('dimension', {}).get('width', 0)
          
          # Process tokens
          for token_idx, token in enumerate(page.get('tokens', [])):
              # Get text segment information
              text_segments = token.get('layout', {}).get('textAnchor', {}).get('textSegments', [])
              
              if not text_segments:
                  continue
                  
              # Extract text using start and end indices
              segment = text_segments[0]
  # Convert string indices to integers
              start_index = int(segment.get('startIndex', 0)) if isinstance(segment.get('startIndex'), str) else segment.get('startIndex', 0)
              end_index = int(segment.get('endIndex', 0)) if isinstance(segment.get('endIndex'), str) else segment.get('endIndex', 0)
              
              # Handle case where startIndex might not be provided
              if 'startIndex' not in segment:
                  start_index = 0 if token_idx == 0 else token_data[-1]['end_index']
                  
              # Extract text
              token_text = full_text[start_index:end_index]
              
              # Skip tokens that are just whitespace or newlines
              if token_text.strip() == '':
                  continue
                  
              # Get bounding box vertices
              vertices = token.get('layout', {}).get('boundingPoly', {}).get('vertices', [])
              
              if not vertices or len(vertices) < 4:
                  continue
                  
              # Calculate token dimensions - handle case where x or y might not be in the vertex
              x_values = [v.get('x', 0) for v in vertices if 'x' in v]
              y_values = [v.get('y', 0) for v in vertices if 'y' in v]
              
              if not x_values or not y_values:
                  continue
                  
              min_x = min(x_values)
              max_x = max(x_values)
              min_y = min(y_values)
              max_y = max(y_values)
              
              width = max_x - min_x
              height = max_y - min_y
              
              # Get break type if available
              break_type = token.get('detectedBreak', {}).get('type', None)
              
              # Store token data
              token_data.append({
                  'text': token_text,
                  'start_index': start_index,
                  'end_index': end_index,
                  'page': page_number,
                  'position': token_idx,
                  'x_min': min_x,
                  'x_max': max_x,
                  'y_min': min_y,
                  'y_max': max_y,
                  'width': width,
                  'height': height,
                  'break_type': break_type,
                  'confidence': token.get('layout', {}).get('confidence', 0)
              })
      
      return token_data

  def calculate_spacing(self, token_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
      """Calculate spacing between consecutive tokens."""
      spacing_data = []
      
      # Sort tokens by position (should already be in order, but just to be sure)
      sorted_tokens = sorted(token_data, key=lambda t: (t['page'], t['position']))
      
      # Calculate spacing between consecutive tokens
      for i in range(len(sorted_tokens) - 1):
          current_token = sorted_tokens[i]
          next_token = sorted_tokens[i + 1]
          
          # Only calculate spacing if tokens are on the same page and line
          # We assume tokens on the same line have overlapping y-coordinates
          current_y_range = (current_token['y_min'], current_token['y_max'])
          next_y_range = (next_token['y_min'], next_token['y_max'])
          
          # Check for y-overlap to determine if tokens are on the same line
          y_overlap = (
              current_y_range[0] <= next_y_range[1] and 
              current_y_range[1] >= next_y_range[0]
          )
          
          # Only consider spacing between tokens on the same line
          if y_overlap and current_token['page'] == next_token['page']:
              # Calculate horizontal spacing
              spacing = next_token['x_min'] - current_token['x_max']
              
              # Only consider positive spacing (tokens that follow each other horizontally)
              if spacing >= 0:
                  spacing_data.append({
                      'left_token': current_token['text'],
                      'right_token': next_token['text'],
                      'position': current_token['position'],
                      'spacing': spacing,
                      'left_token_width': current_token['width'],
                      'right_token_width': next_token['width'],
                      'break_type': current_token['break_type']
                  })
      
      return spacing_data

  def analyze_trends(self, token_data: List[Dict[str, Any]], spacing_data: List[Dict[str, Any]]) -> Dict[str, Any]:
      """Analyze trends in token sizes and spacing throughout the document."""
      if not token_data or len(token_data) < 3:
          return {
              "token_size_trend": "Insufficient data for token size analysis",
              "spacing_trend": "Insufficient data for spacing analysis",
              "token_width_slope": None,
              "token_height_slope": None,
              "spacing_slope": None
          }
      
      # Analyze token size trends
      positions = np.array([t['position'] for t in token_data])
      widths = np.array([t['width'] for t in token_data])
      heights = np.array([t['height'] for t in token_data])
      
      # Linear regression for width trend
      if len(positions) > 1:
          width_slope, width_intercept = np.polyfit(positions, widths, 1)
          height_slope, height_intercept = np.polyfit(positions, heights, 1)
          
          # Calculate R² values for fit quality
          width_mean = np.mean(widths)
          height_mean = np.mean(heights)
          width_r2 = 1 - (np.sum((widths - (width_slope * positions + width_intercept))**2) / 
                          np.sum((widths - width_mean)**2))
          height_r2 = 1 - (np.sum((heights - (height_slope * positions + height_intercept))**2) / 
                           np.sum((heights - height_mean)**2))
      else:
          width_slope = height_slope = width_r2 = height_r2 = None
      
      # Analyze spacing trends
      if spacing_data and len(spacing_data) > 1:
          spacing_positions = np.array([s['position'] for s in spacing_data])
          spacings = np.array([s['spacing'] for s in spacing_data])
          spacing_slope, spacing_intercept = np.polyfit(spacing_positions, spacings, 1)
          
          # Calculate R² value for spacing fit quality
          spacing_mean = np.mean(spacings)
          spacing_r2 = 1 - (np.sum((spacings - (spacing_slope * spacing_positions + spacing_intercept))**2) / 
                            np.sum((spacings - spacing_mean)**2))
      else:
          spacing_slope = spacing_r2 = None
      
      # Calculate percentage change from start to end
      if len(positions) > 1:
          predicted_start_width = width_slope * min(positions) + width_intercept
          predicted_end_width = width_slope * max(positions) + width_intercept
          width_pct_change = ((predicted_end_width - predicted_start_width) / predicted_start_width) * 100 if predicted_start_width != 0 else 0
          
          predicted_start_height = height_slope * min(positions) + height_intercept
          predicted_end_height = height_slope * max(positions) + height_intercept
          height_pct_change = ((predicted_end_height - predicted_start_height) / predicted_start_height) * 100 if predicted_start_height != 0 else 0
      else:
          width_pct_change = height_pct_change = 0
      
      if spacing_data and len(spacing_data) > 1:
          predicted_start_spacing = spacing_slope * min(spacing_positions) + spacing_intercept
          predicted_end_spacing = spacing_slope * max(spacing_positions) + spacing_intercept
          spacing_pct_change = ((predicted_end_spacing - predicted_start_spacing) / predicted_start_spacing) * 100 if predicted_start_spacing != 0 else 0
      else:
          spacing_pct_change = 0
      
      # Determine trends based on slopes and confidence (using R²)
      width_trend = "No clear trend"
      if width_slope is not None:
          if width_r2 > 0.5:  # Strong correlation
              if width_slope < -0.5:
                  width_trend = "Strongly decreasing"
              elif width_slope < 0:
                  width_trend = "Slightly decreasing"
              elif width_slope > 0.5:
                  width_trend = "Strongly increasing"
              elif width_slope > 0:
                  width_trend = "Slightly increasing"
              else:
                  width_trend = "Stable"
          else:  # Weak correlation
              if width_slope < 0:
                  width_trend = "Weakly decreasing (inconsistent)"
              elif width_slope > 0:
                  width_trend = "Weakly increasing (inconsistent)"
              else:
                  width_trend = "Stable"
      
      height_trend = "No clear trend"
      if height_slope is not None:
          if height_r2 > 0.5:  # Strong correlation
              if height_slope < -0.5:
                  height_trend = "Strongly decreasing"
              elif height_slope < 0:
                  height_trend = "Slightly decreasing"
              elif height_slope > 0.5:
                  height_trend = "Strongly increasing"
              elif height_slope > 0:
                  height_trend = "Slightly increasing"
              else:
                  height_trend = "Stable"
          else:  # Weak correlation
              if height_slope < 0:
                  height_trend = "Weakly decreasing (inconsistent)"
              elif height_slope > 0:
                  height_trend = "Weakly increasing (inconsistent)"
              else:
                  height_trend = "Stable"
      
      spacing_trend = "No clear trend"
      if spacing_slope is not None:
          if spacing_r2 > 0.5:  # Strong correlation
              if spacing_slope < -0.5:
                  spacing_trend = "Strongly decreasing"
              elif spacing_slope < 0:
                  spacing_trend = "Slightly decreasing"
              elif spacing_slope > 0.5:
                  spacing_trend = "Strongly increasing"
              elif spacing_slope > 0:
                  spacing_trend = "Slightly increasing"
              else:
                  spacing_trend = "Stable"
          else:  # Weak correlation
              if spacing_slope < 0:
                  spacing_trend = "Weakly decreasing (inconsistent)"
              elif spacing_slope > 0:
                  spacing_trend = "Weakly increasing (inconsistent)"
              else:
                  spacing_trend = "Stable"
      
      return {
          "token_width_trend": width_trend,
          "token_height_trend": height_trend,
          "spacing_trend": spacing_trend,
          "token_width_slope": width_slope,
          "token_height_slope": height_slope,
          "spacing_slope": spacing_slope,
          "width_r2": width_r2,
          "height_r2": height_r2,
          "spacing_r2": spacing_r2,
          "width_pct_change": width_pct_change,
          "height_pct_change": height_pct_change,
          "spacing_pct_change": spacing_pct_change
      }

  def summarize_results(self, token_data: List[Dict[str, Any]], spacing_data: List[Dict[str, Any]], trends: Dict[str, Any]) -> str:
      """Generate a human-readable summary of the handwriting analysis."""
      
      summary = []
      summary.append("=== HANDWRITING COMPRESSION ANALYSIS SUMMARY ===\n")
      
      # Number of tokens analyzed
      summary.append(f"• Analyzed {len(token_data)} tokens across {len(set(t['page'] for t in token_data))} pages")
      
      # Token width analysis
      summary.append("\n== TOKEN WIDTH ANALYSIS ==")
      avg_width = np.mean([t['width'] for t in token_data])
      summary.append(f"• Average token width: {avg_width:.2f} pixels")
      
      if trends['token_width_slope'] is not None:
          change_per_token = trends['token_width_slope']
          total_change = change_per_token * (len(token_data)-1)
          pct_change = trends['width_pct_change']
          
          if abs(pct_change) < 1:
              significance = "negligible"
          elif abs(pct_change) < 5:
              significance = "minor"
          elif abs(pct_change) < 15:
              significance = "moderate"
          else:
              significance = "significant"
              
          direction = "decrease" if change_per_token < 0 else "increase"
          summary.append(f"• Token width trend: {trends['token_width_trend']}")
          summary.append(f"• Change rate: {abs(change_per_token):.2f} pixels per token ({direction})")
          summary.append(f"• Total change from first to last token: {abs(total_change):.2f} pixels ({abs(pct_change):.1f}% {direction})")
          summary.append(f"• Trend strength (R²): {trends['width_r2']:.3f}")
          summary.append(f"• Interpretation: {significance.capitalize()} {direction} in token width")
      
      # Token height analysis
      summary.append("\n== TOKEN HEIGHT ANALYSIS ==")
      avg_height = np.mean([t['height'] for t in token_data])
      summary.append(f"• Average token height: {avg_height:.2f} pixels")
      
      if trends['token_height_slope'] is not None:
          change_per_token = trends['token_height_slope']
          total_change = change_per_token * (len(token_data)-1)
          pct_change = trends['height_pct_change']
          
          if abs(pct_change) < 1:
              significance = "negligible"
          elif abs(pct_change) < 5:
              significance = "minor"
          elif abs(pct_change) < 15:
              significance = "moderate"
          else:
              significance = "significant"
              
          direction = "decrease" if change_per_token < 0 else "increase"
          summary.append(f"• Token height trend: {trends['token_height_trend']}")
          summary.append(f"• Change rate: {abs(change_per_token):.2f} pixels per token ({direction})")
          summary.append(f"• Total change from first to last token: {abs(total_change):.2f} pixels ({abs(pct_change):.1f}% {direction})")
          summary.append(f"• Trend strength (R²): {trends['height_r2']:.3f}")
          summary.append(f"• Interpretation: {significance.capitalize()} {direction} in token height")
      
      # Spacing analysis
      if spacing_data and len(spacing_data) > 1 and trends['spacing_slope'] is not None:
          summary.append("\n== TOKEN SPACING ANALYSIS ==")
          avg_spacing = np.mean([s['spacing'] for s in spacing_data])
          summary.append(f"• Average spacing between tokens: {avg_spacing:.2f} pixels")
          
          change_per_token = trends['spacing_slope']
          total_change = change_per_token * (len(spacing_data)-1)
          pct_change = trends['spacing_pct_change']
          
          if abs(pct_change) < 1:
              significance = "negligible"
          elif abs(pct_change) < 5:
              significance = "minor"
          elif abs(pct_change) < 15:
              significance = "moderate"
          else:
              significance = "significant"
              
          direction = "decrease" if change_per_token < 0 else "increase"
          summary.append(f"• Spacing trend: {trends['spacing_trend']}")
          summary.append(f"• Change rate: {abs(change_per_token):.2f} pixels per token position ({direction})")
          summary.append(f"• Total change from first to last spacing: {abs(total_change):.2f} pixels ({abs(pct_change):.1f}% {direction})")
          summary.append(f"• Trend strength (R²): {trends['spacing_r2']:.3f}")
          summary.append(f"• Interpretation: {significance.capitalize()} {direction} in token spacing")
      
      # Overall conclusion
      summary.append("\n== CONCLUSION ==")
      
      # Determine if there's compression in width, height, or spacing
      width_compressed = trends.get('token_width_slope', 0) is not None and trends['token_width_slope'] < 0 and trends.get('width_r2', 0) > 0.3
      height_compressed = trends.get('token_height_slope', 0) is not None and trends['token_height_slope'] < 0 and trends.get('height_r2', 0) > 0.3
      spacing_compressed = trends.get('spacing_slope', 0) is not None and trends['spacing_slope'] < 0 and trends.get('spacing_r2', 0) > 0.3
      
      if width_compressed and spacing_compressed:
          summary.append("• The handwriting shows compression in both token width and spacing between tokens.")
          summary.append("  This indicates the writer was likely speeding up or conserving space.")
      elif width_compressed:
          summary.append("• The handwriting shows compression in token width but not in spacing.")
          summary.append("  The writer may have been writing faster while maintaining consistent spacing.")
      elif spacing_compressed:
          summary.append("• The handwriting shows compression in spacing but token sizes remain consistent.")
          summary.append("  The writer may have been conserving space while maintaining letter size.")
      elif height_compressed:
          summary.append("• The handwriting shows compression in token height only.")
          summary.append("  This is a less common pattern but suggests some adaptation in writing style.")
      else:
          summary.append("• No significant compression detected in token size or spacing.")
          summary.append("  The handwriting appears consistent throughout the text.")
      
      return "\n".join(summary)

  def visualize_trends(self, token_data: List[Dict[str, Any]], spacing_data: List[Dict[str, Any]], output_path="handwriting_analysis.png"):
      """Create visualizations of token size and spacing trends."""
      if not token_data or len(token_data) < 2:
          print("Not enough data for visualization")
          return
      
      plt.figure(figsize=(15, 12))
      
      # Plot token widths
      plt.subplot(3, 1, 1)
      positions = [t['position'] for t in token_data]
      widths = [t['width'] for t in token_data]
      texts = [t['text'] for t in token_data]
      
      plt.scatter(positions, widths, alpha=0.7, s=100)
      
      # Add text labels to points
      for i, txt in enumerate(texts):
          plt.annotate(txt, (positions[i], widths[i]), 
                       textcoords="offset points", 
                       xytext=(0, 10), 
                       ha='center')
      
      if len(positions) > 1:
          # Add trend line
          slope, intercept = np.polyfit(positions, widths, 1)
          trend_x = np.array([min(positions), max(positions)])
          trend_y = slope * trend_x + intercept
          plt.plot(trend_x, trend_y, 'r--', linewidth=2, 
                   label=f'Slope: {slope:.2f} px/token')
          
          # Calculate and display R²
          width_mean = np.mean(widths)
          r2 = 1 - (np.sum((widths - (slope * np.array(positions) + intercept))**2) / 
                    np.sum((widths - width_mean)**2))
          plt.text(min(positions), max(widths) * 0.9, 
                   f'R² = {r2:.3f}\nChange: {slope * len(positions):.1f} px', 
                   bbox=dict(facecolor='white', alpha=0.5))
          
          plt.legend()
      
      plt.title('Token Width Trend', fontsize=14)
      plt.xlabel('Token Position', fontsize=12)
      plt.ylabel('Token Width (pixels)', fontsize=12)
      plt.grid(True, alpha=0.3)
      
      # Plot token heights
      plt.subplot(3, 1, 2)
      heights = [t['height'] for t in token_data]
      plt.scatter(positions, heights, alpha=0.7, color='green', s=100)
      
      # Add text labels to points
      for i, txt in enumerate(texts):
          plt.annotate(txt, (positions[i], heights[i]), 
                       textcoords="offset points", 
                       xytext=(0, 10), 
                       ha='center')
      
      if len(positions) > 1:
          # Add trend line
          slope, intercept = np.polyfit(positions, heights, 1)
          trend_x = np.array([min(positions), max(positions)])
          trend_y = slope * trend_x + intercept
          plt.plot(trend_x, trend_y, 'r--', linewidth=2, 
                   label=f'Slope: {slope:.2f} px/token')
          
          # Calculate and display R²
          height_mean = np.mean(heights)
          r2 = 1 - (np.sum((heights - (slope * np.array(positions) + intercept))**2) / 
                    np.sum((heights - height_mean)**2))
          plt.text(min(positions), max(heights) * 0.9, 
                   f'R² = {r2:.3f}\nChange: {slope * len(positions):.1f} px', 
                   bbox=dict(facecolor='white', alpha=0.5))
          
          plt.legend()
      
      plt.title('Token Height Trend', fontsize=14)
      plt.xlabel('Token Position', fontsize=12)
      plt.ylabel('Token Height (pixels)', fontsize=12)
      plt.grid(True, alpha=0.3)
      
      # Plot spacing between tokens
      if spacing_data and len(spacing_data) > 1:
          plt.subplot(3, 1, 3)
          spacing_positions = [s['position'] for s in spacing_data]
          spacings = [s['spacing'] for s in spacing_data]
          left_tokens = [s['left_token'] for s in spacing_data]
          right_tokens = [s['right_token'] for s in spacing_data]
          labels = [f"{left}→{right}" for left, right in zip(left_tokens, right_tokens)]
          
          plt.scatter(spacing_positions, spacings, alpha=0.7, color='purple', s=100)
          
          # Add text labels to points
          for i, txt in enumerate(labels):
              plt.annotate(txt, (spacing_positions[i], spacings[i]), 
                           textcoords="offset points", 
                           xytext=(0, 10), 
                           ha='center')
          
          # Add trend line
          slope, intercept = np.polyfit(spacing_positions, spacings, 1)
          trend_x = np.array([min(spacing_positions), max(spacing_positions)])
          trend_y = slope * trend_x + intercept
          plt.plot(trend_x, trend_y, 'r--', linewidth=2, 
                   label=f'Slope: {slope:.2f} px/token')
          
          # Calculate and display R²
          spacing_mean = np.mean(spacings)
          r2 = 1 - (np.sum((spacings - (slope * np.array(spacing_positions) + intercept))**2) / 
                    np.sum((spacings - spacing_mean)**2))
          plt.text(min(spacing_positions), max(spacings) * 0.9, 
                   f'R² = {r2:.3f}\nChange: {slope * len(spacing_positions):.1f} px', 
                   bbox=dict(facecolor='white', alpha=0.5))
          
          plt.legend()
          
          plt.title('Token Spacing Trend', fontsize=14)
          plt.xlabel('Position', fontsize=12)
          plt.ylabel('Spacing Between Tokens (pixels)', fontsize=12)
          plt.grid(True, alpha=0.3)
      
      plt.tight_layout()
      plt.savefig(output_path)
      plt.close()
      return output_path

  def analyze_handwriting_compression(self, json_data, output_path="handwriting_analysis.png"):
      """
      Main function to analyze whether handwriting shows compression over the document.
      
      Args:
          json_data: Either a dict containing the Document AI response, a JSON string, or a file path
          output_path: Where to save the visualization image
          
      Returns:
          A dictionary containing analysis results and a text summary
      """
      import os
      
      # Load document data
      doc_data = self.load_document_ai_response(json_data)
      
      # Extract token information
      token_data = self.extract_token_data(doc_data)
      
      if not token_data:
          return {
              "success": False,
              "error": "No valid tokens found in the document",
              "token_count": 0
          }
      
      # Calculate spacing between tokens
      spacing_data = self.calculate_spacing(token_data)
      
      # Analyze trends
      trends = self.analyze_trends(token_data, spacing_data)
      
      # Generate summary
      summary = self.summarize_results(token_data, spacing_data, trends)
      
      # Create visualizations if we have enough data
      visualization_path = None
      if len(token_data) > 1:
          visualization_path = self.visualize_trends(token_data, spacing_data, output_path)
      
      print(summary)
      
      return {
          "success": True,
          "token_data": token_data,
          "spacing_data": spacing_data,
          "trends": trends,
          "summary": summary,
          "visualization_path": visualization_path,
          "token_count": len(token_data)
      }
  

def test_service():
      # Example 1: Using the JSON directly
      example_json = """
      {
        "uri": "",
        "mimeType": "image/jpeg",
        "text": "Horse meat is disgusting!\\n",
        "pages": [{
          "pageNumber": 1,
          "dimension": {
            "width": 4104.0,
            "height": 1465.0,
            "unit": "pixels"
          },
          "tokens": [
            {
              "layout": {
                "textAnchor": {
                  "textSegments": [{
                    "endIndex": "6"
                  }]
                },
                "boundingPoly": {
                  "vertices": [{
                    "x": 702,
                    "y": 526
                  }, {
                    "x": 1323,
                    "y": 527
                  }, {
                    "x": 1323,
                    "y": 941
                  }, {
                    "x": 702,
                    "y": 940
                  }]
                }
              },
              "detectedBreak": {
                "type": "SPACE"
              }
            },
            {
              "layout": {
                "textAnchor": {
                  "textSegments": [{
                    "startIndex": "6",
                    "endIndex": "11"
                  }]
                },
                "boundingPoly": {
                  "vertices": [{
                    "x": 1379,
                    "y": 527
                  }, {
                    "x": 1912,
                    "y": 527
                  }, {
                    "x": 1911,
                    "y": 940
                  }, {
                    "x": 1380,
                    "y": 940
                  }]
                }
              },
              "detectedBreak": {
                "type": "SPACE"
              }
            },
            {
              "layout": {
                "textAnchor": {
                  "textSegments": [{
                    "startIndex": "11",
                    "endIndex": "14"
                  }]
                },
                "boundingPoly": {
                  "vertices": [{
                    "x": 2007,
                    "y": 527
                  }, {
                    "x": 2322,
                    "y": 527
                  }, {
                    "x": 2322,
                    "y": 940
                  }, {
                    "x": 2007,
                    "y": 940
                  }]
                }
              },
              "detectedBreak": {
                "type": "SPACE"
              }
            },
            {
              "layout": {
                "textAnchor": {
                  "textSegments": [{
                    "startIndex": "14",
                    "endIndex": "24"
                  }]
                },
                "boundingPoly": {
                  "vertices": [{
                    "x": 2383,
                    "y": 527
                  }, {
                    "x": 3337,
                    "y": 527
                  }, {
                    "x": 3336,
                    "y": 940
                  }, {
                    "x": 2383,
                    "y": 940
                  }]
                }
              }
            },
            {
              "layout": {
                "textAnchor": {
                  "textSegments": [{
                    "startIndex": "24",
                    "endIndex": "26"
                  }]
                },
                "boundingPoly": {
                  "vertices": [{
                    "x": 3281,
                    "y": 527
                  }, {
                    "x": 3445,
                    "y": 527
                  }, {
                    "x": 3445,
                    "y": 940
                  }, {
                    "x": 3281,
                    "y": 940
                  }]
                }
              },
              "detectedBreak": {
                "type": "WIDE_SPACE"
              }
            }
          ]
        }]
      }
      """
      service = HandwritingAnalysisService()
      # Example 2: Create a file from the JSON and analyze
      with open("example_document.json", "w") as f:
          f.write(example_json)
      
      print("Analyzing from JSON string:")
      results = service.analyze_handwriting_compression(example_json)
      
      print("\nAnalyzing from file:")
      file_results = service.analyze_handwriting_compression("example_document.json")
      
      # Clean up the temp file
      os.remove("example_document.json")

