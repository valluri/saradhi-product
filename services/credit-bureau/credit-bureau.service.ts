import { Action, Method, Service } from 'moleculer-decorators';
import { Constants, CtxMeta, KeyValuePair, KeyValuePair2, ServiceBase } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { CbRequest } from '@Entities/credit-bureau';
import { CbIdType, CbStatusType } from '@ServiceHelpers/enums';
import { CbRepository } from '@Repositories/cb-repository';
import { MoreThan, Not } from 'typeorm';

@Service({
	name: 'creditBureau',
	version: 1,
})
export default class CreditBureauService extends ServiceBase {
	private CONTENT_TYPE: string = 'application/xml';
	private CREDIT_REPORT_END_POINT: string = 'Inquiry/doGet.service/requestResponse';

	@Action({
		params: {
			idType: { type: 'string' },
			id: Constants.ParamValidation.id,
		},
	})
	public async get(ctx: Context<{ idType: CbIdType; id: string }>): Promise<CbRequest> {
		return new CbRequest();
	}

	@Action({
		params: {
			idType: { type: 'string' },
			id: Constants.ParamValidation.id,
		},
	})
	public async getScore(ctx: Context<{ idType: CbIdType; id: string }>): Promise<KeyValuePair2<number, number>> {
		return new KeyValuePair2<number, number>(0, 0);
	}

	/*
	- this method tries to fetch the report from the local db
  - gets the report from the db only if the report has been generated this calendar month
	- else, fetches the report from the bureau
	*/
	@Method
	private static async CbGet(ctx: Context<{ idType: CbIdType; id: string }>, scoreOnly: boolean): Promise<KeyValuePair2<number, string>> {
		const reportsAfter: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const dbItem: CbRequest = await CbRepository.getResource(ctx, CbRequest, {
			where: {
				identifier: ctx.params.id,
				identifierType: ctx.params.idType,
				status: Not(CbStatusType.Error),
				createdDate: MoreThan(reportsAfter),
			},
			orderByLimits: {
				orderBy: 'createdDate',
				sortOrder: Constants.SORT_ORDER_DESC,
				limit: 1,
			},
		});

		if (dbItem == null) {
			// no report. request one now
			try {
				// CreditBureauBL.CreditReportRequest(request);
				return new KeyValuePair2<number, string>(1, 'Requested report');
			} catch (e) {
				return new KeyValuePair2<number, string>(-1, (e as any).toString());
			}
		}

		if (dbItem.status == CbStatusType.Error) {
			// report errd
			return new KeyValuePair2<number, string>(-2, dbItem.error!);
		} else if (dbItem.status == CbStatusType.Requested) {
			// still waiting for report
			return new KeyValuePair2<number, string>(2, 'Waiting for report');
		}

		if (scoreOnly) {
			if (dbItem.scoreAvailable) {
				// report downloaded and score is available
				return new KeyValuePair2<number, string>(0, dbItem.score!.toString());
			} else if (dbItem.status == CbStatusType.Success && !dbItem.scoreAvailable) {
				// report downloaded, but score is not available
				return new KeyValuePair2<number, string>(-4, '0');
			} else {
				return new KeyValuePair2<number, string>(-3, 'No Score available');
			}
		}
		return new KeyValuePair2<number, string>(0, dbItem.responseUrl!);
	}

	// 		internal static bool CreditReportDownload(CreditBureauRequest creditReport) {
	// 			CrifHighMarkConfig security = CreditBureauBL.GetConfig();
	// 			XmlDocument requestXmlDom = new XmlDocument();

	// 			string requestXmlFileName = Path.Combine(Utility.AppResourcesPath, "Xml", "CreditReportDownloadRequest.xml");
	// 			requestXmlDom.Load(requestXmlFileName);
	// 			XmlNode headerNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/HEADER-SEGMENT");
	// 			XmlNode inquiryNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/INQUIRY");

	// 			headerNode.SelectSingleNode("SUB-MBR-ID").InnerText = security.SubMbrId;
	// 			headerNode.SelectSingleNode("INQ-DT-TM").InnerText = DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss");

	// 			// app-segment values
	// 			inquiryNode.SelectSingleNode("INQUIRY-UNIQUE-REF-NO").InnerText = creditReport.UniqueRef;
	// 			inquiryNode.SelectSingleNode("REPORT-ID").InnerText = creditReport.ReportId;
	// 			inquiryNode.SelectSingleNode("REQUEST-DT-TM").InnerText = DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss");

	// 			string errorMessage = string.Empty;
	// 			try {
	// 				string requestUrl = security.BaseUrl + CREDIT_REPORT_END_POINT;
	// 				XmlDocument responseXmlDom = CreditBureauBL.PostAndVerify(security, requestUrl, requestXmlDom);

	// 				const string RESPONSE_TYPE_XPATH = "/BASE-REPORT-FILE/INQUIRY-STATUS/INQUIRY/RESPONSE/RESPONSE-TYPE";
	// 				if (responseXmlDom.SelectNodes(RESPONSE_TYPE_XPATH).Count != 0) {
	// 					if (string.Compare(responseXmlDom.SelectSingleNode("RESPONSE_TYPE_XPATH").InnerText, "IN PROCESS", true) == 0) {
	// 						return false;
	// 					}
	// 					else {
	// 						errorMessage = "Invalid Response type";
	// 					}
	// 				}
	// 				else if (responseXmlDom.SelectNodes("/INDV-REPORT-FILE/INDV-REPORTS/INDV-REPORT").Count != 0) {
	// 					const string scoreNodePath = "/INDV-REPORT-FILE/INDV-REPORTS/INDV-REPORT/SCORES/SCORE/SCORE-VALUE";
	// 					XmlNode scoreNode = responseXmlDom.SelectSingleNode(scoreNodePath);

	// 					string s3Url = S3.UploadFileAsync(responseXmlDom, security.S3BucketName, Guid.NewGuid().ToString()).Result;

	// 					using (ArthImpactDbContext dbContext = new ArthImpactDbContext()) {
	// 						CreditBureauRequest dbVersion = dbContext.CreditBureauRequests.Find(creditReport.Id);

	// 						if (scoreNode != null) {
	// 							dbVersion.Score = Convert.ToInt32(scoreNode.InnerText);
	// 							dbVersion.ScoreAvailable = true;
	// 						}
	// 						else {
	// 							dbVersion.ScoreAvailable = false;
	// 						}
	// 						dbVersion.ResponseXml = responseXmlDom.OuterXml;
	// 						dbVersion.ResponseReceivedAt = DateTime.Now;
	// 						dbVersion.Status = CreditBureauRequestStatus.Success;
	// 						dbVersion.ResponseXmlS3Url = s3Url;
	// 						dbContext.SaveChanges();
	// 					}
	// 					return true;
	// 				}
	// 			}
	// 			catch (Exception ex) {
	// 				errorMessage = ex.Message;
	// 			}

	// 			if (errorMessage.HasValue()) {
	// 				ArthImpactDbContext context = new ArthImpactDbContext();
	// 				CreditBureauRequest dbVersion = context.CreditBureauRequests.Find(creditReport.Id);
	// 				dbVersion.Error = errorMessage;
	// 				dbVersion.ResponseReceivedAt = DateTime.Now;
	// 				dbVersion.Status = CreditBureauRequestStatus.Error;
	// 				context.SaveChanges();
	// 			}

	// 			return false;
	// 		}

	//

	// 		internal static void CreditReportRequest(CreditBureauRequest applicantData) {
	// 			string errorMessage = string.Empty;
	// 			bool customArgumentException = false;
	// 			ArthImpactDbContext context = new ArthImpactDbContext();
	// 			applicantData.UniqueRef = DateTime.Now.ToString("ddMMyyyyHHmmss") + new Random().Next(100000, 999999).ToString();
	// 			applicantData.RequestType = CreditBureauRequestType.CreditReport;
	// 			context.CreditBureauRequests.Add(applicantData);
	// 			context.SaveChanges();

	// 			try {
	// 				if (string.IsNullOrWhiteSpace(applicantData.Identifier)) {
	// 					throw new CreditBureauRequestArgumentException("ID is mandatory");
	// 				}

	// 				applicantData.Address = Utility.CleanInput(applicantData.Address);
	// 				applicantData.State = Utility.CleanInput(applicantData.State);
	// 				if (string.IsNullOrWhiteSpace(applicantData.State)) {
	// 					throw new CreditBureauRequestArgumentException("State is mandatory");
	// 				}
	// 				if (string.IsNullOrWhiteSpace(applicantData.Address)) {
	// 					throw new CreditBureauRequestArgumentException("Address is mandatory");
	// 				}
	// 				if (string.IsNullOrWhiteSpace(applicantData.City)) {
	// 					throw new CreditBureauRequestArgumentException("City is mandatory");
	// 				}
	// 				if (string.IsNullOrWhiteSpace(applicantData.ApplicantName)) {
	// 					throw new CreditBureauRequestArgumentException("Applicant Name is mandatory");
	// 				}
	// 				if (string.IsNullOrWhiteSpace(applicantData.Pin)) {
	// 					throw new CreditBureauRequestArgumentException("PIN Code is mandatory");
	// 				}
	// 				//if (applicantData.DateOfBirth == DateTime.MinValue) {
	// 				//  throw new CreditBureauRequestArgumentException("Invalid date of birth.");
	// 				//}

	// 				CrifHighMarkConfig security = CreditBureauBL.GetConfig();
	// 				XmlDocument requestXmlDom = new XmlDocument();

	// 				string requestXmlFileName = Path.Combine(Utility.AppResourcesPath, "Xml", "CreditReportRequest.xml");
	// 				requestXmlDom.Load(requestXmlFileName);
	// 				XmlNode headerNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/HEADER-SEGMENT");
	// 				XmlNode inquiryNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/INQUIRY");
	// 				XmlNode applicationSegmentNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/INQUIRY/APPLICATION-SEGMENT");
	// 				XmlNode applicantSegmentNode = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/INQUIRY/APPLICANT-SEGMENT");

	// 				headerNode.SelectSingleNode("SUB-MBR-ID").InnerText = security.SubMbrId;
	// 				headerNode.SelectSingleNode("INQ-DT-TM").InnerText = DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss");

	// 				// app-segment values
	// 				applicationSegmentNode.SelectSingleNode("INQUIRY-UNIQUE-REF-NO").InnerText = applicantData.UniqueRef;
	// 				applicationSegmentNode.SelectSingleNode("BRANCH-ID").InnerText = Utility.GetConfigValue("HIGHMARK_BRANCH_ID");
	// 				applicationSegmentNode.SelectSingleNode("LOS-APP-ID").InnerText = Utility.GetConfigValue("HIGHMARK_LOS_APP_ID");

	// 				// applicant details
	// 				applicantSegmentNode.SelectSingleNode("APPLICANT-NAME/NAME1").InnerText = applicantData.ApplicantName;
	// 				applicantSegmentNode.SelectSingleNode("IDS/ID/TYPE").InnerText = GetIdType(applicantData.IdentifierType);
	// 				applicantSegmentNode.SelectSingleNode("IDS/ID/VALUE").InnerText = applicantData.Identifier;
	// 				applicantSegmentNode.SelectSingleNode("DOB/DOB-DATE").InnerText = applicantData.DateOfBirth.ToString("dd-MM-yyyy");

	// 				XmlNode addressSegment = requestXmlDom.SelectSingleNode("/REQUEST-REQUEST-FILE/INQUIRY/ADDRESS-SEGMENT/ADDRESS");
	// 				addressSegment.SelectSingleNode("TYPE").InnerText = "D0" + ((int) applicantData.AddressType).ToString();
	// 				addressSegment.SelectSingleNode("ADDRESS-1").InnerText = applicantData.Address;
	// 				addressSegment.SelectSingleNode("CITY").InnerText = applicantData.City;
	// 				addressSegment.SelectSingleNode("STATE").InnerText = GetStateCode(applicantData.State);
	// 				addressSegment.SelectSingleNode("PIN").InnerText = applicantData.Pin;

	// 				string requestUrl = security.BaseUrl + CREDIT_REPORT_END_POINT;

	// 				XmlDocument responseXmlDom = CreditBureauBL.PostAndVerify(security, requestUrl, requestXmlDom);

	// 				XmlNode responseInquiryNode = responseXmlDom.SelectSingleNode("/REPORT-FILE/INQUIRY-STATUS/INQUIRY");
	// 				string responseType = responseInquiryNode.SelectSingleNode("RESPONSE-TYPE").InnerText.ToUpper();

	// 				if (responseType == "ERROR") {
	// 					XmlNode errorNode = responseInquiryNode.SelectSingleNode("ERRORS/ERROR");
	// 					string errorCode = errorNode.SelectSingleNode("CODE").InnerText;
	// 					string errorDescription = errorNode.SelectSingleNode("DESCRIPTION").InnerText;
	// 					errorMessage = string.Format("{0}: {1}", errorCode, errorDescription);
	// 				}
	// 				else if (responseType == "ACKNOWLEDGEMENT") {
	// 					applicantData.ReportId = responseInquiryNode.SelectSingleNode("REPORT-ID").InnerText;

	// 					new QueueBL().Add(new QueueItemCreditReport {
	// 						JsonData = JsonConvert.SerializeObject(applicantData)
	// 					});
	// 				}
	// 				else {
	// 					errorMessage = "Unknown response type";
	// 				}
	// 			}
	// 			catch (CreditBureauRequestArgumentException ex) {
	// 				customArgumentException = true;
	// 				errorMessage = ex.Message;
	// 			}
	// 			catch (Exception ex) {
	// 				errorMessage = ex.Message;
	// 			}

	// 			applicantData.Error = errorMessage;
	// 			if (errorMessage.Length != 0) {
	// 				applicantData.Status = CreditBureauRequestStatus.Error;
	// 			}
	// 			context.SaveChanges();

	// 			if (errorMessage.Length != 0) {
	// 				if (customArgumentException) {
	// 					throw new CreditBureauRequestArgumentException(errorMessage);
	// 				}
	// 				else {
	// 					throw new ApplicationException(errorMessage);
	// 				}
	// 			}
	// 		}

	// 		internal static string CreditReportRequestInBulk(BulkRequest request) {
	// 			List<CreditBureauRequest> requests = HelperMethods.ConvertCsvToObjectList<CreditBureauRequestCsvMap, CreditBureauRequest>(request.FileData);
	// 			requests = requests.Where(r => r.ApplicantName.Length != 0).ToList();

	// 			foreach (CreditBureauRequest item in requests) {
	// 				try {
	// 					item.TrySetIdentifierType();
	// 					item.Source = "Upload";
	// 					CreditBureauBL.CreditReportRequest(item);
	// 				}
	// 				catch (Exception ex) {
	// 					LoggerBL.LogException(className, "BulkCreditBureauRequest", ex);
	// 				}
	// 			}

	// 			return string.Format("{0} requests received", requests.Count);
	// 		}

	// 		internal static byte[] CreditReportsExport(DateTime from, DateTime to, string query) {
	// 			PagedResponse<CreditBureauRequestSummary> reports = CreditReportsGet(0, int.MaxValue, null, null, from, to, query);

	// 			return Utilities.CsvUtilities.HelperMethods.ConvertObjectListToCsv<CreditBureauRequestSummaryCsvMap, CreditBureauRequestSummary>(reports.Data);
	// 		}

	// 		internal static PagedResponse<CreditBureauRequestSummary> CreditReportsGet(int offset, int limit, string sortBy, string sortOrder, DateTime from, DateTime to, string query) {
	// 			bool blankQuery = !query.HasValue();
	// 			query = query.HasValue() ? query : string.Empty;
	// 			sortBy = sortBy.HasValue() ? sortBy : "Id";
	// 			sortOrder = sortOrder.HasValue() ? sortOrder : "asc";

	// 			List<CreditBureauRequestSummary> dataRows = CreditBureauDL.CreditRequestSummarySearch(from, to, blankQuery, query, sortBy, sortOrder, offset, limit);
	// 			int dataCount = CreditBureauDL.CreditRequestSummarySearchCount(from, to, blankQuery, query);

	// 			return new PagedResponse<CreditBureauRequestSummary>(dataCount, dataRows);
	// 		}

	// 		internal static IEnumerable<CreditScoreConfig> CreditScoreConfigGet() {
	// 			return new ArthImpactDbContext().CreditScoreConfig.Where(c => !c.Deleted);
	// 		}

	// 		internal static CreditScoreConfig CreditScoreConfigInsert(CreditScoreConfig config) {
	// 			ArthImpactDbContext context = new ArthImpactDbContext();
	// 			context.CreditScoreConfig.Add(config);
	// 			context.SaveChanges();

	// 			return config;
	// 		}

	// 		private static string GetIdType(VerificationIdType identifierType) {
	// 			switch (identifierType) {
	// 				case VerificationIdType.Pan:
	// 					return "ID07";

	// 				case VerificationIdType.Uid:
	// 					return "ID03";

	// 				case VerificationIdType.VoterId:
	// 					return "ID02";

	// 				case VerificationIdType.Passport:
	// 					return "ID01";

	// 				default:
	// 					return string.Empty;
	// 			}
	// 		}

	// 		private static CrifHighMarkConfig GetConfig() {
	// 			string certificateDetails = string.Empty;
	// 			string userId = string.Empty;
	// 			string password = string.Empty;
	// 			string url = string.Empty;
	// 			string mbrId = string.Empty;
	// 			string subMbrId = string.Empty;
	// 			string s3BucketName = string.Empty;

	// 			if (Utility.IsProduction) {
	// 				certificateDetails = "HIGHMARK_CERTIFICATE_PROD";
	// 				url = "HIGHMARK_URL_PROD";
	// 				userId = "HIGHMARK_USERID_PROD";
	// 				password = "HIGHMARK_PASSWORD_PROD";
	// 				mbrId = "HIGHMARK_MBRID_PROD";
	// 				subMbrId = "HIGHMARK_SUB_MBRID_PROD";
	// 				s3BucketName = "HIGHMARK_RESPONSE_S3URL_PROD";
	// 			}
	// 			else {
	// 				certificateDetails = "HIGHMARK_CERTIFICATE_TEST";
	// 				url = "HIGHMARK_URL_TEST";
	// 				userId = "HIGHMARK_USERID_TEST";
	// 				password = "HIGHMARK_PASSWORD_TEST";
	// 				mbrId = "HIGHMARK_MBRID_TEST";
	// 				subMbrId = "HIGHMARK_SUB_MBRID_TEST";
	// 				s3BucketName = "HIGHMARK_RESPONSE_S3URL_TEST";
	// 			}

	// 			return new CrifHighMarkConfig {
	// 				BaseUrl = Utility.GetConfigValue(url),
	// 				UserId = Utility.GetConfigValue(userId),
	// 				Password = Utility.GetConfigValue(password),
	// 				MbrId = Utility.GetConfigValue(mbrId),
	// 				SubMbrId = Utility.GetConfigValue(subMbrId),
	// 				CertificateName = Utility.GetConfigValue(certificateDetails),
	// 				S3BucketName = Utility.GetConfigValue(s3BucketName)
	// 			};
	// 		}

	// 		private static string GetStateCode(string stateName) {
	// 			if (stateName.Length == 2) {
	// 				// it is already a state-code
	// 				return stateName;
	// 			}

	// 			string originalStateName = stateName;
	// 			stateName = stateName.ToUpper();
	// 			stateName = stateName.Replace(" AND ", string.Empty);
	// 			stateName = stateName.Replace("&", string.Empty);
	// 			stateName = stateName.Replace(" ", string.Empty);
	// 			stateName = stateName.Replace(".", string.Empty);

	// 			if (stateName.Length == 2) {
	// 				// it is already a state-code
	// 				return stateName;
	// 			}

	// 			switch (stateName) {
	// 				case "ANDHRAPRADESH":
	// 					return "AP";

	// 				case "ARUNACHALPRADESH":
	// 					return "AR";

	// 				case "ASSAM":
	// 					return "AS";

	// 				case "BIHAR":
	// 					return "BR";

	// 				case "CHATTISGARH":
	// 					return "CG";

	// 				case "GOA":
	// 					return "GA";

	// 				case "GUJARAT":
	// 					return "GJ";

	// 				case "HARYANA":
	// 					return "HR";

	// 				case "HIMACHALPRADESH":
	// 					return "HP";

	// 				case "JAMMUKASHMIR":
	// 					return "JK";

	// 				case "JHARKHAND":
	// 					return "JH";

	// 				case "KARNATAKA":
	// 					return "KA";

	// 				case "KERALA":
	// 					return "KL";

	// 				case "MADHYAPRADESH":
	// 					return "MP";

	// 				case "MAHARASHTRA":
	// 					return "MH";

	// 				case "MANIPUR":
	// 					return "MN";

	// 				case "MEGHALAYA":
	// 					return "ML";

	// 				case "MIZORAM":
	// 					return "MZ";

	// 				case "NAGALAND":
	// 					return "ML";

	// 				case "ORISSA":
	// 					return "OR";

	// 				case "PUNJAB":
	// 					return "PB";

	// 				case "RAJASTHAN":
	// 					return "RJ";

	// 				case "SIKKIM":
	// 					return "SK";

	// 				case "TAMILNADU":
	// 					return "TN";

	// 				case "TELANGANA":
	// 					return "TS";

	// 				case "TRIPURA":
	// 					return "TR";

	// 				case "UTTARAKHAND":
	// 					return "UK";

	// 				case "UTTARPRADESH":
	// 					return "UP";

	// 				case "WESTBENGAL":
	// 					return "WB";

	// 				case "ANDAMANNICOBAR":
	// 					return "AN";

	// 				case "CHANDIGARH":
	// 					return "CH";

	// 				case "DADRANAGARHAVELI":
	// 					return "DN";

	// 				case "DAMANDIU":
	// 					return "DD";

	// 				case "DELHI":
	// 					return "DL";

	// 				case "LAKSHADWEEP":
	// 					return "LD";

	// 				case "PONDICHERRY":
	// 					return "PY";

	// 				default:
	// 					return originalStateName;
	// 			}
	// 		}

	// 		private static XmlDocument PostAndVerify(CrifHighMarkConfig security, string requestUrl, XmlDocument requestXmlDom) {
	// 			string errorMessage = string.Empty;
	// 			string responseData = string.Empty;
	// 			bool callSucceeded = false;

	// 			WebHeaderCollection headers = new WebHeaderCollection {
	// 				{ "requestXml", requestXmlDom.OuterXml },
	// 				{ "userId", security.UserId },
	// 				{ "password", security.Password },
	// 				{ "mbrid", security.MbrId},
	// 				{ "productType", "INDV" },
	// 				{ "productVersion", "1.0" },
	// 				{ "reqVolType", "INDV" }
	// 			};

	// 			XmlDocument responseXmlDom = new XmlDocument();
	// 			ApiLogEntry apiLogEntry = new ApiLogEntry {
	// 				Application = "crif-highmark",
	// 				User = security.UserId,
	// 				Machine = Environment.MachineName,
	// 				RequestContentType = CONTENT_TYPE,
	// 				RequestMethod = HttpMethod.Post.ToString(),
	// 				RequestTimestamp = DateTime.Now,
	// 				RequestUri = requestUrl,
	// 				RequestContentBody = string.Empty,
	// 				RequestHeaders = ApiLogHandler.SerializeHeaders(headers)
	// 			};

	// 			try {
	// 				KeyValuePair<bool, string> response = Http.Post(requestUrl, headers, null, CONTENT_TYPE, security.CertificateName);
	// 				callSucceeded = response.Key;
	// 				responseData = response.Value;
	// 			}
	// 			catch (Exception ex) {
	// 				LoggerBL.LogException(className, "PostAndVerify", ex);
	// 			}

	// 			if (callSucceeded) {
	// 				if (responseData.Length != 0) {
	// 					responseXmlDom.LoadXml(responseData);

	// 					if (responseXmlDom.OuterXml.Length == 0) {
	// 						errorMessage = "Response does not contain Xml.";
	// 					}
	// 				}
	// 			}
	// 			else {
	// 				errorMessage = responseData;
	// 			}

	// 			apiLogEntry.ResponseStatusCode = callSucceeded ? 200 : 500;
	// 			apiLogEntry.ResponseTimestamp = DateTime.Now;
	// 			apiLogEntry.ResponseContentBody = responseData;
	// 			apiLogEntry.ResponseContentType = CONTENT_TYPE;

	// 			LoggerBL.LogApi(apiLogEntry);

	// 			if (errorMessage.Length != 0) {
	// 				throw new ApplicationException(errorMessage);
	// 			}

	// 			return responseXmlDom;
	// 		}

	// 		internal static void UploadCreditReportsToS3() {
	// 			CrifHighMarkConfig config = GetConfig();

	// 			using (ArthImpactDbContext dbContext = new ArthImpactDbContext()) {
	// 				List<CreditBureauRequest> bureauRequests = dbContext
	// 					.CreditBureauRequests
	// 					.Where(e => e.Status == CreditBureauRequestStatus.Success && e.ResponseXmlS3Url == "")
	// 					.Take(100)
	// 					.ToList();

	// 				foreach (CreditBureauRequest item in bureauRequests) {
	// 					item.ResponseXmlS3Url = S3.UploadFileAsync(Encoding.UTF8.GetBytes(item.ResponseXml), config.S3BucketName, Guid.NewGuid().ToString()).Result;
	// 					dbContext.SaveChanges();
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// public string GetOnlyXml() {
	// 		XmlDocument document = this.GetResponseXmlDocument();

	// 		if (document != null) {
	// 			XmlNode htmlNode = document.SelectSingleNode(HTML_NODE);

	// 			if (htmlNode != null) {
	// 				htmlNode.InnerText = string.Empty;
	// 			}

	// 			return document.OuterXml;
	// 		}

	// 		return string.Empty;
	// 	}

	// 	public string GetHtml() {
	// 		XmlDocument document = this.GetResponseXmlDocument();

	// 		if (document != null) {
	// 			XmlNode htmlNode = document.SelectSingleNode(HTML_NODE);

	// 			if (htmlNode != null) {
	// 				return htmlNode.InnerText;
	// 			}
	// 		}

	// 		return string.Empty;
	// 	}

	// 	public void TrySetIdentifierType() {
	// 		if (!this.Identifier.HasValue()) {
	// 			throw new InvalidIdentifierException();
	// 		}
	// 		this.Identifier = this.Identifier.Replace(" ", string.Empty);
	// 		if (this.Identifier.Length == 10) {
	// 			this.IdentifierType = VerificationIdType.Pan;
	// 		}
	// 		else if (this.Identifier.Length == 12) {
	// 			this.IdentifierType = VerificationIdType.Uid;
	// 		}
	// 		else {
	// 			throw new InvalidIdentifierException();
	// 		}
	// 	}

	// 	internal string GetXml() {
	// 		if (this.Status == CreditBureauRequestStatus.Success) {
	// 			if (!string.IsNullOrWhiteSpace(this.ResponseXml)) {
	// 				return this.ResponseXml;
	// 			}
	// 			if (!string.IsNullOrWhiteSpace(this.ResponseXmlS3Url)) {
	// 				this.ResponseXml = Encoding.UTF8.GetString(S3.DownloadFile(this.ResponseXmlS3Url));
	// 				return this.ResponseXml;
	// 			}
	// 		}
	// 		return "";
	// 	}

	// 	internal XmlDocument GetResponseXmlDocument() {
	// 		if (this.Status == CreditBureauRequestStatus.Success) {
	// 			XmlDocument document = new XmlDocument();

	// 			document.LoadXml(this.GetXml());
	// 			return document;
	// 		}

	// 		return null;
	// 	}
}

module.exports = CreditBureauService;
