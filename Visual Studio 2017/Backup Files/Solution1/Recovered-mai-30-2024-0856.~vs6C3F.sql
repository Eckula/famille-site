USE [Askia_Lists]
GO

UPDATE [dbo].[AskList11433]
   SET [AskPriority]=0
  
     


wHERE 
(
	[CIBLE] like '%Accidents%'
)
and
(
	[Occurrences]<>1
)

GO