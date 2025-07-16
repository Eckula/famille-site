/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ListID]
      ,[ListTitle]
      ,[ListPath]
      ,[ExternalDSN]
      ,[ExternalTable]
      ,[ExternalUniqueIdFieldName]
      ,[ExternalUniqueIdFieldType]
      ,[ExternalUniqueIdFieldSize]
      ,[ExternalPhoneField]
      ,[ExternalEmailField]
      ,[ListAvailable]
      ,[SurveyID]
      ,[Target]
      ,[ProjectID]
      ,[IsUsingSQLServer]
      ,[MaxNumberSimCalls]
      ,[Deleted]
      ,[IsDerivation]
      ,[MaxDerivations]
      ,[SpanBetweenDerivations]
      ,[StopDerivationCauses]
      ,[SMTPServer]
      ,[SMTPPort]
      ,[SMTPUsername]
      ,[SMTPPassword]
      ,[SMTPMaxConnections]
      ,[SMTPMailsPerGroup]
      ,[SMTPGroupIntervalHours]
      ,[SMTPGroupIntervalMinutes]
      ,[SMTPFromAddress]
      ,[SMTPReplyToAddress]
      ,[SMTPCCAddress]
      ,[SMTPBCCAddress]
      ,[SMTPIncludePlainTextAlternative]
      ,[SMTPAddMessageAsAttachment]
      ,[InitialMailTemplatePath]
      ,[InitialMailSubject]
      ,[FirstReminderMailTemplatePath]
      ,[FirstReminderMailSubject]
      ,[DynamicFilterCode]
      ,[DynamicFilterCodeFirstReminder]
      ,[SamplingFilterCode]
      ,[SamplingLimit]
      ,[SMTPUseSSL]
      ,[CheckBouncedEmails]
      ,[ReturnPathPrefix]
      ,[ReturnPathSuffix]
      ,[POP3Server]
      ,[POP3Port]
      ,[POP3Username]
      ,[POP3Password]
      ,[POP3UseSSL]
      ,[NumberSelectionType]
      ,[OverrideCallBackOptions]
      ,[CallBackOptions]
      ,[CallBackScript]
      ,[OverrideAppointmentSettings]
      ,[AppointmentWarning]
      ,[AppointmentType]
      ,[IsAlwaysCallAppointment]
      ,[ImportanceMin]
      ,[IsDeleteUnusedAppointmentData]
      ,[IsIgnoreSkillsWhenAppointment]
      ,[IsBlankOutAppointment]
      ,[IsAllowAppointmentForAgentOnly]
      ,[AppointmentCallbackDecrease]
      ,[AppointmentMax]
      ,[ListMailingAvailable]
      ,[AppointmentReleaseTime]
      ,[IsAllowCallAcknowledgement]
      ,[CreationTime]
      ,[LastModificationTime]
      ,[DeleteUnrecognizedEmailsTreshold]
      ,[StartTimeCallbacksSuspended]
      ,[NumberPrefix]
      ,[IsDoNotContactList]
      ,[NoFreshCallsOutsideShifts]
      ,[ExtendedTimeZoneMatchingSets]
      ,[DefaultTimeZone]
      ,[SMTPEncPassword]
      ,[BounceRetryDelays]
      ,[POP3EncPassword]
      ,[IncludeInQuotaImportanceMin]
      ,[DatabaseConnectionConfigurationID]
      ,[IsForceUnusedContacts]
      ,[ForceUnusedContactsLevel]
      ,[UnsubscribeListId]
      ,[UnsubscribeTemplatePath]
  FROM [Askia_Cca].[dbo].[Lists]
  where SurveyID ='4372'

  select [SurveyID], [ListID],[ExternalTable],[ListTitle]
  FROM [Askia_Cca].[dbo].[Lists]
  
  where SurveyID ='4372'

 SELECT 
    t1.[SurveyID],
    t2.[ListID],
    t3.[Email]
FROM [Askia_Cca].[dbo].[Surveys] AS t1
JOIN [Askia_Lists].[dbo].[AskEmails] AS t2 ON t1.[SurveyID] = t2.[SurveyID]
JOIN [Askia_Statistics].[dbo].[Emails] AS t3 ON t2.[ListID] = t3.[ListID]
WHERE t1.[SurveyID] = '4372';



SELECT TABLE_NAME  TABLE_Askia_Cca
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';







