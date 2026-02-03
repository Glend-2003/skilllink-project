import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { ReportCreateDto } from "./dto/reportCreate.dto";
import { ReportUpdateDto } from "./dto/reportUpdate.dto";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}

  create(reporterId: number, dto: ReportCreateDto) {
    const report = this.reportsRepository.create({
      ...dto,
      reporterUserId: reporterId,
    });
    return this.reportsRepository.save(report);
  }

  findAll() {
    return this.reportsRepository.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: number) {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException("Report not found");
    return report;
  }

  async update(id: number, dto: ReportUpdateDto) {
    const report = await this.findOne(id);
    if (dto.status === "resolved" && report.status !== "resolved") {
      report.resolvedAt = new Date();
    }
    Object.assign(report, dto);
    return this.reportsRepository.save(report);
  }

 
  async remove(id: number) {
    const report = await this.findOne(id);
    await this.reportsRepository.remove(report);
    return { deleted: true, id };
  }
}
