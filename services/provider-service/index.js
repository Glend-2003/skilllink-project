const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration of the MySQL database connection
const dbConfig = {
  host: process.env.DB_HOST || 'mysql_db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skilllink_db'
};

let db;

(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
})();

// Get all available providers
app.get('/api/providers', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.profile_image_url,
        pp.provider_id,
        pp.business_name,
        pp.business_description,
        pp.years_experience,
        pp.is_verified,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM users u
      JOIN provider_profiles pp ON u.user_id = pp.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE u.user_type = 'provider' AND pp.available_for_work = 1
      GROUP BY pp.provider_id, u.user_id
      ORDER BY average_rating DESC
    `;

    const [providers] = await db.execute(query);

    // Map to the format expected by the app
    const formattedProviders = providers.map((p, index) => ({
      id: p.user_id.toString(),
      name: p.business_name,
      category: 'Servicios',
      rating: parseFloat(p.average_rating) || 4.5,
      location: 'Centro, Ciudad',
      description: p.business_description,
      hourlyRate: 25 + (index * 5),
      verified: p.is_verified === 1,
      yearsExperience: p.years_experience,
      reviewCount: p.review_count,
      profileImageUrl: p.profile_image_url
    }));

    res.json(formattedProviders);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: 'Error getting providers' });
  }
});

// Get provider by ID
app.get('/api/providers/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.profile_image_url,
        pp.provider_id,
        pp.business_name,
        pp.business_description,
        pp.years_experience,
        pp.service_radius_km,
        pp.is_verified,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM users u
      JOIN provider_profiles pp ON u.user_id = pp.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE u.user_id = ?
      GROUP BY pp.provider_id, u.user_id
    `;

    const [providers] = await db.execute(query, [providerId]);

    if (providers.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const p = providers[0];
    const provider = {
      id: p.user_id.toString(),
      name: p.business_name,
      description: p.business_description,
      rating: parseFloat(p.average_rating) || 4.5,
      verified: p.is_verified === 1,
      yearsExperience: p.years_experience,
      serviceRadius: p.service_radius_km,
      reviewCount: p.review_count,
      email: p.email,
      profileImageUrl: p.profile_image_url
    };

    res.json(provider);
  } catch (error) {
    console.error('Error getting provider:', error);
    res.status(500).json({ error: 'Error getting provider' });
  }
});


// Get provider profile by user_id
app.get('/api/providers/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        pp.provider_id as id,
        pp.provider_id,
        pp.business_name,
        pp.business_description,
        pp.years_experience,
        pp.service_radius_km,
        pp.is_verified as verified,
        u.user_id,
        u.email,
        u.profile_image_url as profileImageUrl,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as reviewCount
      FROM provider_profiles pp
      JOIN users u ON pp.user_id = u.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE pp.user_id = ?
      GROUP BY pp.provider_id, u.user_id
    `;

    const [providers] = await db.execute(query, [userId]);

    if (providers.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found for this user' });
    }

    const provider = providers[0];
    res.json({
      id: provider.id,
      providerId: provider.provider_id,
      businessName: provider.business_name,
      description: provider.business_description,
      yearsExperience: provider.years_experience,
      serviceRadius: provider.service_radius_km,
      verified: provider.verified === 1,
      userId: provider.user_id,
      email: provider.email,
      profileImageUrl: provider.profileImageUrl,
      rating: parseFloat(provider.rating) || 0,
      reviewCount: provider.reviewCount
    });
  } catch (error) {
    console.error('Error getting provider profile by user_id:', error);
    res.status(500).json({ error: 'Error getting provider profile' });
  }
});

// Get provider reviews
app.get('/api/providers/:providerId/reviews', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        r.review_id,
        r.reviewer_user_id as userId,
        u.email as userName,
        r.rating,
        r.review_text as comment,
        DATE_FORMAT(r.created_at, '%d/%m/%Y') as date
      FROM reviews r
      JOIN users u ON r.reviewer_user_id = u.user_id
      WHERE r.reviewed_user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const [reviews] = await db.execute(query, [providerId]);
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Error getting reviews' });
  }
});

// Get provider services
app.get('/api/providers/:providerId/services', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        s.service_id as id,
        s.service_id as serviceId,
        s.service_title as name,
        s.service_description as description,
        s.base_price as price,
        s.price_type,
        s.estimated_duration_minutes,
        CONCAT(
          CASE 
            WHEN s.estimated_duration_minutes IS NULL THEN 'Consultar'
            WHEN s.estimated_duration_minutes < 60 THEN CONCAT(s.estimated_duration_minutes, ' min')
            ELSE CONCAT(FLOOR(s.estimated_duration_minutes / 60), 'h ', MOD(s.estimated_duration_minutes, 60), 'm')
          END
        ) as duration
      FROM services s
      JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      WHERE pp.user_id = ? AND s.is_active = 1 AND s.approval_status = 'approved'
      ORDER BY s.service_title
    `;

    const [services] = await db.execute(query, [providerId]);
    res.json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ error: 'Error getting services' });
  }
});


app.get('/api/services', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.service_id,
        s.service_title,
        s.service_description,
        s.base_price,
        s.price_type,
        s.estimated_duration_minutes,
        c.category_name,
        pp.provider_id,
        pp.business_name as provider_name,
        pp.is_verified as provider_verified,
        u.user_id,
        u.profile_image_url,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM services s
      JOIN service_categories c ON s.category_id = c.category_id
      JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      JOIN users u ON pp.user_id = u.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE s.is_active = 1 AND s.approval_status = 'approved'
      GROUP BY s.service_id, u.user_id
      ORDER BY s.created_at DESC
    `;

    const [services] = await db.execute(query);


    const formattedServices = services.map(s => ({
      id: s.service_id.toString(),
      providerId: s.user_id.toString(),
      name: s.service_title,
      category: s.category_name,
      rating: parseFloat(s.average_rating) || 4.5,
      location: 'Centro, Ciudad',
      description: s.service_description,
      hourlyRate: s.base_price || 0,
      priceType: s.price_type,
      estimatedDuration: s.estimated_duration_minutes,
      verified: s.provider_verified === 1,
      providerName: s.provider_name,
      reviewCount: s.review_count,
      profileImageUrl: s.profile_image_url
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ error: 'Error getting services' });
  }
});

// Provider Request - Create (User submits request to become provider)
app.post('/api/provider-request', async (req, res) => {
  try {
    const { businessName, description, services, location } = req.body;
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Extract userId from token (assuming JWT format "Bearer <token>")
    const token = authHeader.split(' ')[1];
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user already has a pending or approved request
    const [existingRequests] = await db.execute(
      'SELECT * FROM provider_requests WHERE user_id = ? AND status IN ("pending", "approved")',
      [userId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending or approved provider request'
      });
    }

    // Insert new provider request
    await db.execute(
      `INSERT INTO provider_requests 
       (user_id, business_name, description, services, location, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, businessName, description, services, location]
    );

    res.status(201).json({ 
      message: 'Provider request submitted successfully',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating provider request:', error);
    res.status(500).json({ error: 'Error creating provider request' });
  }
});

// Provider Requests Endpoints (Admin)

// Get all provider requests (with optional status filter)
app.get('/api/provider-requests', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        pr.*,
        u.email as userEmail
      FROM provider_requests pr
      JOIN users u ON pr.user_id = u.user_id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE pr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pr.created_at DESC';
    
    const [requests] = await db.execute(query, params);
    
    const formattedRequests = requests.map(r => ({
      requestId: r.request_id,
      userId: r.user_id,
      userEmail: r.userEmail,
      businessName: r.business_name,
      description: r.description,
      services: r.services,
      experience: r.experience,
      location: r.location,
      hourlyRate: r.hourly_rate,
      portfolio: r.portfolio,
      certifications: r.certifications,
      status: r.status,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
      reviewedBy: r.reviewed_by,
      reviewNotes: r.review_notes
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching provider requests:', error);
    res.status(500).json({ error: 'Error fetching provider requests' });
  }
});

// Review a provider request (approve/reject)
app.put('/api/provider-requests/review', async (req, res) => {
  try {
    const { requestId, status, reviewNotes } = req.body;
    
    if (!requestId || !status) {
      return res.status(400).json({ error: 'requestId and status are required' });
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }
    
    // Get request details first to send notification
    const [requests] = await db.execute(
      'SELECT pr.*, u.email FROM provider_requests pr JOIN users u ON pr.user_id = u.user_id WHERE pr.request_id = ?',
      [requestId]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({ error: 'Provider request not found' });
    }
    
    const request = requests[0];
    
    // Update request status
    await db.execute(
      `UPDATE provider_requests 
       SET status = ?, reviewed_at = NOW(), review_notes = ? 
       WHERE request_id = ?`,
      [status, reviewNotes || null, requestId]
    );
    
    // If approved, create provider profile
    if (status === 'approved') {
      // Check if provider profile already exists
      const [existing] = await db.execute(
        'SELECT provider_id FROM provider_profiles WHERE user_id = ?',
        [request.user_id]
      );
      
      if (existing.length === 0) {
        // Create provider profile with only available columns
        await db.execute(
          `INSERT INTO provider_profiles 
           (user_id, business_name, business_description) 
           VALUES (?, ?, ?)`,
          [
            request.user_id,
            request.business_name,
            request.description
          ]
        );
        
        // Update user_type to 'provider' in users table
        await db.execute(
          `UPDATE users SET user_type = 'provider' WHERE user_id = ?`,
          [request.user_id]
        );
        
        // Add provider role (role_id = 2) to user_roles table
        await db.execute(
          `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 2)`,
          [request.user_id]
        );
      }
      
      // Send approval notification to the user (not admin)
      try {
        const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
        
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
          to: request.email,
          subject: '¡Tu solicitud de proveedor ha sido aprobada! - SkillLink',
          type: 'provider-approval',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Solicitud Aprobada - SkillLink</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 SkillLink</h1>
                          <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 14px;">Conecta con los mejores profesionales</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">¡Felicitaciones! Ahora eres un Proveedor</h2>
                          <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                            Tu solicitud para ser proveedor ha sido <strong>aprobada</strong>.
                          </p>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                            <strong>Negocio:</strong> ${request.business_name}
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                            <tr>
                              <td align="center" style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #10b981;">
                                <p style="color: #059669; font-weight: bold; margin: 0;">✅ Ya puedes ofrecer tus servicios en la plataforma</p>
                              </td>
                            </tr>
                          </table>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                            Inicia sesión para comenzar a crear y publicar tus servicios.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 SkillLink. Todos los derechos reservados.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
      } catch (error) {
        console.error('Error sending provider approval notification:', error.message);
      }
    } else if (status === 'rejected') {
      // Send rejection notification to the user (not admin)
      try {
        const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
        
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
          to: request.email,
          subject: 'Actualización sobre tu solicitud de proveedor - SkillLink',
          type: 'provider-rejection',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Solicitud No Aprobada - SkillLink</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); padding: 40px 20px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">SkillLink</h1>
                          <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 14px;">Conecta con los mejores profesionales</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">Actualización sobre tu Solicitud</h2>
                          <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                            Tu solicitud para ser proveedor no ha sido aprobada en este momento.
                          </p>
                          ${reviewNotes ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;"><strong>Motivo:</strong> ${reviewNotes}</p>` : ''}
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                            Si tienes preguntas o deseas más información, por favor contacta al equipo de soporte.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 SkillLink. Todos los derechos reservados.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
      } catch (error) {
        console.error('Error sending provider rejection notification:', error.message);
      }
    }
    
    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Error reviewing provider request:', error);
    res.status(500).json({ error: 'Error reviewing provider request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Provider Service running on port ${PORT}`);
});
