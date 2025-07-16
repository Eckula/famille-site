/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [AskInterview]
      ,[AskSurveyId]
      ,[AskSurveyPosition]
      ,[AskSurveyInterviewId]
      ,[AskSurveyInterviewState]
      ,[AskTaskInterviewGuid]
      ,[AskAppManual]
      ,[AskAppTimeUTC]
      ,[AskAppImportance]
      ,[AskAppMessage]
      ,[AskAppAgentId]
      ,[AskAppForAgentOnly]
      ,[AskCallAcknowledgementMessage]
      ,[AskPriority]
      ,[AskCallNow]
      ,[AskQuotaCategory]
      ,[AskSkillCategory]
      ,[AskQuotaReached]
      ,[AskOrderPriority]
      ,[AskDoNotCallListId]
      ,[AskDoNotMailListId]
      ,[AskInterviewFiltered]
      ,[AskTimeZoneId]
      ,[AskMode]
      ,[AskInCall]
      ,[AskDerivation]
      ,[AskLastRecoverUTC]
      ,[AskIsOverCallback]
      ,[AskCallCount]
      ,[AskTimeAvailableUTC]
      ,[AskShiftAvailable]
      ,[AskLastTelephonyResponseUTC]
      ,[AskLastTelephonyResponseUTCOffsetAgent]
      ,[AskLastTelephonyResponseUTCOffsetRespondent]
      ,[AskLastTelephonyShift]
      ,[AskLastTelephonyShiftPercentage]
      ,[AskLastTelephonyResult]
      ,[AskLastTelephonySubResult]
      ,[AskTelephonyWorkingPriority]
      ,[AskCallbackMinutesSuspended]
      ,[AskLastWebResponseUTC]
      ,[AskLastWebResponseUTCOffsetRespondent]
      ,[AskLastWebResult]
      ,[AskWebWorkingPriority]
      ,[ID_ENOV]
      ,[TELEPHONE]
      ,[AskHashDNC_TELEPHONE]
      ,[TYPE]
      ,[CODE_COMMUNE]
      ,[DOUBLON_TEL]
      ,[TRANCHE_EFFECTIF]
      ,[NAF_LIB]
      ,[NAF]
      ,[CENTRE_DISTRIBUTEUR]
      ,[CP]
      ,[LIBELLE_SPECIFIQUE]
      ,[LIBELLE_ADRESSE]
      ,[LIBELLE_BATIMENT]
      ,[RAISON_SOCIALE_2]
      ,[RAISON_SOCIALE]
      ,[SIRET]
      ,[CODE_ACTION]
      ,[NUM_COMMANDE]
      ,[VILLE]
      ,[VILLE_CODE_SAISIE]
  FROM [Askia_Lists].[dbo].[AskList11494]

  select*  
  FROM [Askia_Lists].[dbo].[AskList11494]
 WHERE [AskPriority]  IS NULL;

 select*  
  FROM [Askia_Lists].[dbo].[AskList11494]
 WHERE [AskPriority]  IS NOT NULL AND [DOUBLON_TEL] NOT LIKE '%doublon%';

USE [Askia_Lists]
GO
UPDATE [dbo].[AskList11494]
   SET [AskPriority]=1
wHERE 
(
	 [DOUBLON_TEL] NOT LIKE '%doublon%'
)
GO

USE [Askia_Lists]
GO
UPDATE [dbo].[AskList11494]
   SET [AskPriority]=0
wHERE 
(
	 [DOUBLON_TEL] LIKE '%doublon%'
)
GO
