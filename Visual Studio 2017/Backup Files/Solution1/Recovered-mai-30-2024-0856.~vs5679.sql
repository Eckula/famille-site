/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT [AskInterview]
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
      ,[e_mail]
      ,[AskHashDNC_e_mail]
      ,[AGE]
      ,[CANAL]
      ,[CIBLE]
      ,[DATE SOUSCRIPTION]
      ,[Date_effet]
      ,[Date_naissance]
      ,[DATE_SOUS]
      ,[Doublons]
      ,[Formule]
      ,[Formule_souscrite]
      ,[LIB_CIV]
      ,[LIB_TYPE_CONTRAT]
      ,[LIB_TYPE_CONTRAT_2]
      ,[nom]
      ,[Numero_contrat]
      ,[prenom]
      ,[SEXE]
      ,[Top_detenteur_AAV]
      ,[Top_detenteur_AUTO]
      ,[Top_detenteur_MRH]
      ,[Top_detenteur_PJ]
      ,[Top_detenteur_SANTE]
      ,[VAGUE]
      ,[Occurrences]
  FROM [Askia_Lists].[dbo].[AskList11433]

  WHERE (
	[CIBLE] like '%Accidents%'
)
and
(
	[Occurrences]<>1
)

SELECT*
FROM [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]
GROUP BY [ID_ENOV];