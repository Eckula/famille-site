/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [AskInterview]
      ,[AskTelephone]
      ,[AskTimeUTC]
      ,[AskUTCOffsetAgent]
      ,[AskUTCOffsetRespondent]
      ,[AskShift]
      ,[AskState]
      ,[AskSubState]
      ,[AgentID]
      ,[CallID]
      ,[AskDerivation]
      ,[AskLastRecoverUTC]
  FROM [Askia_Lists].[dbo].[AskCall11494]

  select*
  from [Askia_Lists].[dbo].[AskCall11494];