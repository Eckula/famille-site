/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [Num_Survey]
      ,[strExtName]
      ,[strDescription]
      ,[strInternalName]
      ,[strButtonNextPath]
      ,[strButtonNextDesc]
      ,[isButtonPause]
      ,[strButtonPausePath]
      ,[strButtonPauseDesc]
      ,[isButtonPrev]
      ,[strButtonPrevPath]
      ,[strButtonPrevDesc]
      ,[htmlBeforeButtons]
      ,[htmlBetweenButtons]
      ,[htmlAfterButtons]
      ,[isTable]
      ,[strTableTag]
      ,[htmlBodyTag]
      ,[isHeaderColumn]
      ,[strHeaderColumn]
      ,[strHeaderText]
      ,[strOtherColumn]
      ,[htmlHeader]
      ,[htmlFooter]
      ,[htmlErrorBefore]
      ,[htmlErrorBetween]
      ,[htmlErrorAfter]
      ,[htmlFinalPage]
      ,[htmlPausePage]
      ,[htmlErrorPage]
      ,[htmlAlreadyCompletedPage]
      ,[isUseCookies]
      ,[CookiesDuration]
      ,[isSaveInDatabase]
      ,[isOnLine]
      ,[htmlOffPage]
      ,[isUseAspPage]
      ,[strAspPageName]
      ,[strQuotas]
      ,[strReport]
      ,[Num_History]
      ,[CcaSurveyId]
      ,[NumDisplay]
      ,[DateToBegin]
      ,[DateToFinish]
      ,[nMaxSizeOfRessources]
      ,[strOutOfQuotaPage]
      ,[IsStoreQuotaInInterview]
      ,[QexFile]
      ,[IsSendUncompletedToCCA]
      ,[FeedbackType]
      ,[IsAllowBlocked]
  FROM [Askia_WebProd].[dbo].[WP_Survey]