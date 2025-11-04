import json, click, requests
from rich import print

BASE = 'http://localhost:8787'

@click.group()
def cli():
    """VerraNET CLI (LARP)"""

@cli.group()
def grove():
    pass

@grove.command('list')
def grove_list():
    r = requests.get(f'{BASE}/groves').json()
    print(r)

@grove.command('create')
@click.option('--name', required=True)
@click.option('--target', type=int, default=1000)
def grove_create(name, target):
    # local-only create (append to data/groves.json)
    with open('../data/groves.json') as f:
        db = json.load(f)
    new = {"id": f"GROVE_{len(db['groves'])+1:03d}", "name": name, "targetTrees": target, "planted": 0, "region":"SIM"}
    db['groves'].append(new)
    with open('../data/groves.json','w') as f:
        json.dump(db, f, indent=2)
    print({'ok': True, 'grove': new})

@cli.group()
def tree():
    pass

@tree.command('mint')
@click.option('--plot-id', required=True)
@click.option('--species', required=True)
@click.option('--planter', 'planter_id', default='SIM_USER')
def tree_mint(plot_id, species, planter_id):
    r = requests.post(f'{BASE}/mint/tree', json={'plotId':plot_id,'species':species,'planterId':planter_id}).json()
    print(r)

@cli.command()
def offsets():
    r = requests.get(f'{BASE}/offsets').json()
    print(r)

if __name__ == '__main__':
    cli()
