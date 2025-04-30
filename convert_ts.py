import pandas as pd

presentaciones = pd.read_csv('./presentaciones_add.csv', sep=',')
datos = pd.read_csv('./data/ BYF.csv', sep=',')

print(datos['presentaciones'])