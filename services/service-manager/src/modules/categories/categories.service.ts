import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

import { CreateCategoryDto } from './dto/categoryCreate.dto';
import { UpdateCategoryDto } from './dto/categoryUpdate.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { categoryId: id },
    });
    if (!category) {
      throw new NotFoundException(`La categoría con ID ${id} no existe`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      categoryId: id,
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException(
        `No se puede actualizar, la categoría ${id} no existe`,
      );
    }

    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return await this.categoryRepository.remove(category);
  }

  // Admin methods
  async findAllWithCount() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.services', 'service')
      .select([
        'category.categoryId',
        'category.categoryName',
        'category.categoryDescription',
        'category.iconUrl',
        'category.isActive',
        'category.displayOrder',
        'category.parentCategoryId',
        'category.createdAt',
      ])
      .addSelect('COUNT(service.serviceId)', 'serviceCount')
      .groupBy('category.categoryId')
      .orderBy('category.displayOrder', 'ASC')
      .getRawAndEntities();

    // Combine raw count with entities
    return categories.entities.map((category, index) => ({
      ...category,
      serviceCount: parseInt(categories.raw[index].serviceCount) || 0,
    }));
  }

  async toggleStatus(id: number) {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return await this.categoryRepository.save(category);
  }
}
