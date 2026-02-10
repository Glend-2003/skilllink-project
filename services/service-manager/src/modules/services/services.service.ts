import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/serviceCreate.dto';
import { UpdateServiceDto } from './dto/serviceUpdate.dto';

import { ProviderProfile } from '../providers/entities/provider.entity';
import { Category } from '../categories/entities/category.entity';
import axios from 'axios';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfile: Repository<ProviderProfile>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    // Validate if ProviderProfile exists
    const provider = await this.providerProfile.findOne({
      where: {
        providerId: createServiceDto.providerId,
      },
    });
    if (!provider) {
      throw new NotFoundException(
        `Proveedor con el ID ${createServiceDto.providerId} no encontrado`,
      );
    }
    // Validate if Category exists
    const category = await this.categoryRepository.findOne({
      where: {
        categoryId: createServiceDto.categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria con el ID ${createServiceDto.categoryId} no encontrada`,
      );
    }

    // If both exist, proceed to create the service
    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id);

    // If the user is trying to change the Provider, validate the new one exists
    if (updateServiceDto.providerId) {
      const provider = await this.providerProfile.findOne({
        where: { providerId: updateServiceDto.providerId },
      });
      if (!provider)
        throw new NotFoundException(
          `Nuevo Proveedor con ID ${updateServiceDto.providerId} no encontrado`,
        );
    }

    // If the user is trying to change the Category, validate the new one exists
    if (updateServiceDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { categoryId: updateServiceDto.categoryId },
      });
      if (!category)
        throw new NotFoundException(
          `Nueva Categoria con ID ${updateServiceDto.categoryId} no encontrada`,
        );
    }

    await this.serviceRepository.update(id, updateServiceDto);
    return this.findOne(id);
  }

  async findAll() {
    const services = await this.serviceRepository.find({
      where: {
        approvalStatus: 'approved',
        isActive: true,
      },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { serviceId: id },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Calculate average rating based on provider's reviews
    const result = await this.serviceRepository.query(
      `
      SELECT 
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.review_id) as reviewCount
      FROM services s
      INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
      WHERE s.service_id = ?
      GROUP BY s.service_id
      `,
      [id],
    );

    const rating = result[0]?.avgRating 
      ? parseFloat(result[0].avgRating) 
      : null;
    const reviewCount = result[0]?.reviewCount || 0;

    return {
      ...service,
      rating,
      reviewCount,
    };
  }

  async findByProvider(providerId: number) {
    // Validate if ProviderProfile exists
    const provider = await this.providerProfile.findOne({
      where: { providerId },
    });
    if (!provider) {
      throw new NotFoundException(
        `Proveedor con el ID ${providerId} no encontrado`,
      );
    }

    // Only return approved and active services for public viewing
    const services = await this.serviceRepository.find({
      where: { 
        providerId,
        approvalStatus: 'approved',
        isActive: true,
      },
      relations: {
        category: true,
        provider: {
          user: true,
        },
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findByUserId(userId: number) {
    // Find the provider profile for this user
    const provider = await this.providerProfile.findOne({
      where: { userId },
    });
    
    if (!provider) {
      throw new NotFoundException(
        `No se encontró perfil de proveedor para el usuario ${userId}`,
      );
    }

    // Return ALL services for the provider (including pending and rejected)
    // This is used by the authenticated provider to see their own services
    const services = await this.serviceRepository.find({
      where: { providerId: provider.providerId },
      relations: {
        category: true,
        provider: {
          user: true,
        },
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return { deleted: true, id };
  }

  // Method to verify a service by admin
  async verifyService(id: number) {
    const service = await this.findOne(id);
    service.isVerified = !service.isVerified;
    service.verificationDate = service.isVerified ? new Date() : null;
    await this.serviceRepository.save(service);
    return this.findOne(id);
  }

  // Admin methods for service approval
  async findPending() {
    const services = await this.serviceRepository.find({
      where: { approvalStatus: 'pending' },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findAllForAdmin() {
    const services = await this.serviceRepository.find({
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async approveService(id: number) {
    const service = await this.findOne(id);
    service.approvalStatus = 'approved';
    service.isActive = true;
    service.isVerified = true;
    service.verificationDate = new Date();
    await this.serviceRepository.save(service);

    // Send notification to the provider (not to admin)
    try {
      const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
      
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
        to: service.provider?.user?.email,
        subject: '¡Tu servicio ha sido aprobado! - SkillLink',
        type: 'service-approval',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Servicio Aprobado - SkillLink</title>
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
                        <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">¡Servicio Aprobado!</h2>
                        <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                          Tu servicio <strong>${service.serviceTitle}</strong> ha sido aprobado y ya está visible para los usuarios.
                        </p>
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                          Los clientes ahora pueden encontrar y solicitar tu servicio en la plataforma.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                          <tr>
                            <td align="center" style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #10b981;">
                              <p style="color: #059669; font-weight: bold; margin: 0;">✅ Estado: Aprobado y Activo</p>
                            </td>
                          </tr>
                        </table>
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
      console.error('Error sending service approval notification:', error.message);
    }

    return this.findOne(id);
  }

  async rejectService(id: number, reason?: string) {
    const service = await this.findOne(id);
    service.approvalStatus = 'rejected';
    service.isActive = false;
    await this.serviceRepository.save(service);

    // Send notification to the provider (not to admin)
    try {
      const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
      
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
        to: service.provider?.user?.email,
        subject: 'Actualización sobre tu servicio - SkillLink',
        type: 'service-rejection',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Servicio No Aprobado - SkillLink</title>
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
                        <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">Actualización sobre tu Servicio</h2>
                        <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                          Tu servicio <strong>${service.serviceTitle}</strong> no ha sido aprobado en este momento.
                        </p>
                        ${reason ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;"><strong>Motivo:</strong> ${reason}</p>` : ''}
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                          Si tienes preguntas, por favor contacta al equipo de soporte.
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
      console.error('Error sending service rejection notification:', error.message);
    }

    return this.findOne(id);
  }
}
