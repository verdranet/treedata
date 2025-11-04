import requests
from dataclasses import dataclass
from typing import List

@dataclass
class Grove:
    id: str
    name: str
    targetTrees: int
    planted: int
    region: str

class VerraNet:
    def __init__(self, base: str = 'http://localhost:8787'):
        self.base = base

    def groves(self) -> List[Grove]:
        r = requests.get(f'{self.base}/groves')
        r.raise_for_status()
        return [Grove(**g) for g in r.json()['groves']]

    def plots(self):
        r = requests.get(f'{self.base}/plots'); r.raise_for_status()
        return r.json()['plots']

    def offsets(self):
        r = requests.get(f'{self.base}/offsets'); r.raise_for_status()
        return r.json()['offsets']

    def mint_tree(self, plot_id: str, species: str, planter_id: str):
        r = requests.post(f'{self.base}/mint/tree', json={
            'plotId': plot_id, 'species': species, 'planterId': planter_id
        })
        r.raise_for_status()
        return r.json()
