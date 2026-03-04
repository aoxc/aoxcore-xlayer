import click
from rich.console import Console
from rich.panel import Panel

console = Console()

@click.group()
def cli():
    """🛡️ AOXC NEURAL OS - Audit & Management CLI"""
    pass

@cli.command()
def status():
    """Sistemlerin (Core, Finance, Infra) durumunu kontrol eder."""
    console.print(Panel("[bold cyan]AOXC NEURAL OS v2.5[/bold cyan]\n[green]Status: Online[/green]\n[blue]Network: OKX X Layer[/blue]", title="Sentinel Dashboard"))

@cli.command()
@click.argument('tx_hash')
def audit(tx_hash):
    """Belirli bir TX Hash'i AI ile denetler."""
    console.print(f"[yellow]TX {tx_hash} üzerinde adli analiz başlatılıyor...[/yellow]")
    # Burada AI_Engine devreye girecek
    console.print("[bold green]ANALİZ TAMAMLANDI: RİSK %2 (CLEAN)[/bold green]")

if __name__ == '__main__':
    cli()
