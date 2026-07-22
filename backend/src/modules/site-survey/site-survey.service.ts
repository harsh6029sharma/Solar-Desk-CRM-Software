import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

type SiteSurveyInput = {
  roofType?: string | undefined;
  roofAreaSqFt?: number | undefined;
  sanctionedLoadKw?: number | undefined;
  monthlyBillAverage?: number | undefined;
  shadowAnalysis?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  surveyPhotosUrl?: string[] | undefined;
};

const ensureOpportunityInOrg = async (
  organizationId: string,
  opportunityId: string
) => {
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId },
  });

  if (!opportunity) {
    throw new ApiError(404, "Opportunity not found");
  }
};

export const createSiteSurvey = async (
  organizationId: string,
  opportunityId: string,
  input: SiteSurveyInput
) => {
  await ensureOpportunityInOrg(organizationId, opportunityId);

  const existing = await prisma.siteSurvey.findUnique({
    where: { opportunityId },
  });

  if (existing) {
    throw new ApiError(409, "Site survey already exists for this opportunity");
  }

  const data: Prisma.SiteSurveyCreateInput = {
    opportunity: { connect: { id: opportunityId } },
    ...(input.roofType !== undefined && { roofType: input.roofType }),
    ...(input.roofAreaSqFt !== undefined && { roofAreaSqFt: input.roofAreaSqFt }),
    ...(input.sanctionedLoadKw !== undefined && { sanctionedLoadKw: input.sanctionedLoadKw }),
    ...(input.monthlyBillAverage !== undefined && { monthlyBillAverage: input.monthlyBillAverage }),
    ...(input.shadowAnalysis !== undefined && { shadowAnalysis: input.shadowAnalysis }),
    ...(input.latitude !== undefined && { latitude: input.latitude }),
    ...(input.longitude !== undefined && { longitude: input.longitude }),
    ...(input.surveyPhotosUrl !== undefined && { surveyPhotosUrl: input.surveyPhotosUrl }),
  };

  return prisma.siteSurvey.create({ data });
};

export const getSiteSurvey = async (
  organizationId: string,
  opportunityId: string
) => {
  const survey = await prisma.siteSurvey.findFirst({
    where: { opportunityId, opportunity: { organizationId } },
  });

  if (!survey) {
    throw new ApiError(404, "Site survey not found");
  }

  return survey;
};

export const updateSiteSurvey = async (
  organizationId: string,
  opportunityId: string,
  input: SiteSurveyInput
) => {
  await getSiteSurvey(organizationId, opportunityId);

  const data: Prisma.SiteSurveyUpdateInput = {
    ...(input.roofType !== undefined && { roofType: input.roofType }),
    ...(input.roofAreaSqFt !== undefined && { roofAreaSqFt: input.roofAreaSqFt }),
    ...(input.sanctionedLoadKw !== undefined && { sanctionedLoadKw: input.sanctionedLoadKw }),
    ...(input.monthlyBillAverage !== undefined && { monthlyBillAverage: input.monthlyBillAverage }),
    ...(input.shadowAnalysis !== undefined && { shadowAnalysis: input.shadowAnalysis }),
    ...(input.latitude !== undefined && { latitude: input.latitude }),
    ...(input.longitude !== undefined && { longitude: input.longitude }),
    ...(input.surveyPhotosUrl !== undefined && { surveyPhotosUrl: input.surveyPhotosUrl }),
  };

  return prisma.siteSurvey.update({ where: { opportunityId }, data });
};

export const deleteSiteSurvey = async (
  organizationId: string,
  opportunityId: string
) => {
  await getSiteSurvey(organizationId, opportunityId);

  return prisma.siteSurvey.delete({ where: { opportunityId } });
};