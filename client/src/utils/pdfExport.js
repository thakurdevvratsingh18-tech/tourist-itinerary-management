/**
 * Client-Side PDF / Clean Print Generator for Itineraries
 * Works reliably without requiring external paid APIs
 */
export function exportItineraryToPDF(trip, itineraries = []) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export your itinerary as PDF');
    return;
  }

  const startDate = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const endDate = trip.endDate
    ? new Date(trip.endDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const daysHtml = (itineraries || [])
    .map(
      (day) => `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; page-break-inside: avoid;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e3d1e;">
        Day ${day.day || ''}: ${day.title || 'Day Plan'} 
        <span style="font-size: 12px; font-weight: normal; color: #6b7280; margin-left: 8px;">
          ${day.date ? new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
        </span>
      </h3>
      ${day.notes ? `<p style="margin: 0 0 12px 0; font-size: 12px; color: #4b5563; font-style: italic;">${day.notes}</p>` : ''}
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f9fafb; text-align: left; color: #4b5563;">
            <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">Time</th>
            <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">Activity</th>
            <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">Type</th>
            <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Cost (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${(day.activities || [])
            .map(
              (act) => `
            <tr>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">
                ${act.startTime || ''} ${act.endTime ? '- ' + act.endTime : ''}
              </td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6;">
                <strong>${act.title || ''}</strong>
                ${act.description ? `<br><span style="font-size: 11px; color: #6b7280;">${act.description}</span>` : ''}
              </td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-transform: capitalize; color: #4b5563;">
                ${act.type || 'sightseeing'}
              </td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: right;">
                ₹${act.estimatedCost || 0}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${trip.title || 'Travel Itinerary'} – TravelCraft</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 40px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #1e3d1e;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .badge {
            display: inline-block;
            background: #e0ede0;
            color: #1e3d1e;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="badge">TravelCraft • Smart Itinerary</span>
              <h1 style="margin: 8px 0 4px 0; font-size: 26px; color: #1e3d1e;">${trip.title || 'Journey Plan'}</h1>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                Dates: ${startDate} – ${endDate} (${trip.numberOfDays || 1} Days) &bull; Travelers: ${trip.numberOfTravelers || 1}
              </p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #6b7280;">Estimated Budget</span>
              <div style="font-size: 20px; font-weight: bold; color: #1e3d1e;">₹${trip.totalBudget ? trip.totalBudget.toLocaleString('en-IN') : 0}</div>
            </div>
          </div>
          ${trip.description ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #4b5563;">${trip.description}</p>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #1e3d1e; margin-bottom: 16px;">Daily Itinerary Schedule</h2>
          ${daysHtml || '<p>No daily activities scheduled yet.</p>'}
        </div>

        <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
          Generated with TravelCraft – Tourist Itinerary Management System
        </footer>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
